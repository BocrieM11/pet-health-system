const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 获取宠物的所有用药记录
router.get('/pet/:petId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const petId = req.params.petId;

  try {
    // 验证宠物所有权
    db.get('SELECT id FROM pets WHERE id = ? AND user_id = ?', [petId, userId], (err, pet) => {
      if (err) {
        console.error('查询宠物失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      if (!pet) {
        return res.status(404).json({ error: '宠物未找到或无权访问' });
      }

      db.all(
        'SELECT * FROM medications WHERE pet_id = ? ORDER BY start_date DESC',
        [petId],
        (err, rows) => {
          if (err) {
            console.error('获取用药记录失败:', err);
            return res.status(500).json({ error: '获取用药记录失败' });
          }
          res.json({ medications: rows || [] });
        }
      );
    });
  } catch (error) {
    console.error('获取用药记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加用药记录
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { pet_id, medication_name, dosage, frequency, start_date, end_date, notes } = req.body;

  // 验证必填字段
  if (!pet_id || !medication_name || !start_date) {
    return res.status(400).json({ error: '宠物ID、药品名称和开始日期为必填项' });
  }

  try {
    // 验证宠物所有权
    db.get('SELECT id FROM pets WHERE id = ? AND user_id = ?', [pet_id, userId], (err, pet) => {
      if (err) {
        console.error('查询宠物失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      if (!pet) {
        return res.status(403).json({ error: '无权访问该宠物' });
      }

      db.run(
        `INSERT INTO medications (pet_id, medication_name, dosage, frequency, start_date, end_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pet_id, medication_name, dosage || '', frequency || 'daily', start_date, end_date || null, notes || ''],
        function(err) {
          if (err) {
            console.error('添加用药记录失败:', err);
            return res.status(500).json({ error: '添加用药记录失败' });
          }
          res.status(201).json({
            message: '用药记录添加成功',
            medicationId: this.lastID
          });
        }
      );
    });
  } catch (error) {
    console.error('添加用药记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新用药记录
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const medicationId = req.params.id;
  const { medication_name, dosage, frequency, start_date, end_date, notes } = req.body;

  try {
    // 验证用药记录所有权
    db.get(
      `SELECT m.* FROM medications m
       JOIN pets p ON m.pet_id = p.id
       WHERE m.id = ? AND p.user_id = ?`,
      [medicationId, userId],
      (err, medication) => {
        if (err) {
          console.error('查询用药记录失败:', err);
          return res.status(500).json({ error: '服务器错误' });
        }
        if (!medication) {
          return res.status(404).json({ error: '用药记录未找到或无权访问' });
        }

        const updates = [];
        const params = [];

        if (medication_name !== undefined) {
          updates.push('medication_name = ?');
          params.push(medication_name);
        }
        if (dosage !== undefined) {
          updates.push('dosage = ?');
          params.push(dosage);
        }
        if (frequency !== undefined) {
          updates.push('frequency = ?');
          params.push(frequency);
        }
        if (start_date !== undefined) {
          updates.push('start_date = ?');
          params.push(start_date);
        }
        if (end_date !== undefined) {
          updates.push('end_date = ?');
          params.push(end_date);
        }
        if (notes !== undefined) {
          updates.push('notes = ?');
          params.push(notes);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: '没有要更新的字段' });
        }

        params.push(medicationId);
        const query = `UPDATE medications SET ${updates.join(', ')} WHERE id = ?`;

        db.run(query, params, function(err) {
          if (err) {
            console.error('更新用药记录失败:', err);
            return res.status(500).json({ error: '更新用药记录失败' });
          }
          res.json({ message: '用药记录更新成功' });
        });
      }
    );
  } catch (error) {
    console.error('更新用药记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用药记录
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const medicationId = req.params.id;

  try {
    db.run(
      `DELETE FROM medications
       WHERE id = ? AND pet_id IN (SELECT id FROM pets WHERE user_id = ?)`,
      [medicationId, userId],
      function(err) {
        if (err) {
          console.error('删除用药记录失败:', err);
          return res.status(500).json({ error: '删除用药记录失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '用药记录未找到' });
        }
        res.json({ message: '用药记录删除成功' });
      }
    );
  } catch (error) {
    console.error('删除用药记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前正在进行的用药
router.get('/active/all', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  try {
    db.all(
      `SELECT m.*, p.name as pet_name
       FROM medications m
       JOIN pets p ON m.pet_id = p.id
       WHERE p.user_id = ?
       AND m.start_date <= ?
       AND (m.end_date IS NULL OR m.end_date >= ?)
       ORDER BY m.start_date DESC`,
      [userId, today, today],
      (err, rows) => {
        if (err) {
          console.error('获取活跃用药记录失败:', err);
          return res.status(500).json({ error: '获取用药记录失败' });
        }
        res.json({ medications: rows || [] });
      }
    );
  } catch (error) {
    console.error('获取活跃用药记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
