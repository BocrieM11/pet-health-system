const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 获取用户的所有提醒
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { status, type } = req.query;

  try {
    let query = 'SELECT r.*, p.name as pet_name FROM reminders r LEFT JOIN pets p ON r.pet_id = p.id WHERE r.user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND r.reminder_type = ?';
      params.push(type);
    }

    query += ' ORDER BY r.scheduled_time ASC';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('获取提醒失败:', err);
        return res.status(500).json({ error: '获取提醒失败' });
      }
      res.json({ reminders: rows || [] });
    });
  } catch (error) {
    console.error('获取提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个提醒详情
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const reminderId = req.params.id;

  try {
    db.get(
      'SELECT r.*, p.name as pet_name FROM reminders r LEFT JOIN pets p ON r.pet_id = p.id WHERE r.id = ? AND r.user_id = ?',
      [reminderId, userId],
      (err, row) => {
        if (err) {
          console.error('获取提醒失败:', err);
          return res.status(500).json({ error: '获取提醒失败' });
        }
        if (!row) {
          return res.status(404).json({ error: '提醒未找到' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('获取提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建新提醒
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { pet_id, reminder_type, title, description, scheduled_time, notification_methods } = req.body;

  // 验证必填字段
  if (!reminder_type || !title || !scheduled_time) {
    return res.status(400).json({ error: '提醒类型、标题和时间为必填项' });
  }

  // 验证提醒类型
  const validTypes = ['vaccine', 'checkup', 'medication', 'custom', 'alert'];
  if (!validTypes.includes(reminder_type)) {
    return res.status(400).json({ error: '无效的提醒类型' });
  }

  // 如果有宠物ID，验证宠物所有权
  if (pet_id) {
    db.get('SELECT id FROM pets WHERE id = ? AND user_id = ?', [pet_id, userId], (err, pet) => {
      if (err || !pet) {
        return res.status(403).json({ error: '无权访问该宠物' });
      }
      createReminder();
    });
  } else {
    createReminder();
  }

  function createReminder() {
    const methods = notification_methods || 'app';

    db.run(
      `INSERT INTO reminders (user_id, pet_id, reminder_type, title, description, scheduled_time, notification_methods)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, pet_id || null, reminder_type, title, description || '', scheduled_time, methods],
      function(err) {
        if (err) {
          console.error('创建提醒失败:', err);
          return res.status(500).json({ error: '创建提醒失败' });
        }
        res.status(201).json({
          message: '提醒创建成功',
          reminderId: this.lastID
        });
      }
    );
  }
});

// 更新提醒
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const reminderId = req.params.id;
  const { title, description, scheduled_time, status, notification_methods } = req.body;

  try {
    // 验证提醒所有权
    db.get('SELECT id FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId], (err, reminder) => {
      if (err) {
        console.error('查询提醒失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      if (!reminder) {
        return res.status(404).json({ error: '提醒未找到或无权访问' });
      }

      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }
      if (scheduled_time !== undefined) {
        updates.push('scheduled_time = ?');
        params.push(scheduled_time);
      }
      if (status !== undefined) {
        const validStatuses = ['pending', 'sent', 'dismissed', 'completed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: '无效的状态' });
        }
        updates.push('status = ?');
        params.push(status);
      }
      if (notification_methods !== undefined) {
        updates.push('notification_methods = ?');
        params.push(notification_methods);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: '没有要更新的字段' });
      }

      params.push(reminderId);
      const query = `UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`;

      db.run(query, params, function(err) {
        if (err) {
          console.error('更新提醒失败:', err);
          return res.status(500).json({ error: '更新提醒失败' });
        }
        res.json({ message: '提醒更新成功' });
      });
    });
  } catch (error) {
    console.error('更新提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除提醒
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const reminderId = req.params.id;

  try {
    db.run(
      'DELETE FROM reminders WHERE id = ? AND user_id = ?',
      [reminderId, userId],
      function(err) {
        if (err) {
          console.error('删除提醒失败:', err);
          return res.status(500).json({ error: '删除提醒失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '提醒未找到' });
        }
        res.json({ message: '提醒删除成功' });
      }
    );
  } catch (error) {
    console.error('删除提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 自动创建疫苗提醒（当疫苗记录有下次接种日期时）
router.post('/auto-vaccine/:vaccinationId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const vaccinationId = req.params.vaccinationId;

  try {
    // 获取疫苗记录
    db.get(
      `SELECT v.*, p.name as pet_name, p.user_id
       FROM vaccinations v
       JOIN pets p ON v.pet_id = p.id
       WHERE v.id = ?`,
      [vaccinationId],
      (err, vaccination) => {
        if (err || !vaccination) {
          return res.status(404).json({ error: '疫苗记录未找到' });
        }

        if (vaccination.user_id !== userId) {
          return res.status(403).json({ error: '无权访问' });
        }

        if (!vaccination.next_due_date) {
          return res.status(400).json({ error: '该疫苗记录没有下次接种日期' });
        }

        // 创建提醒（提前7天）
        const dueDate = new Date(vaccination.next_due_date);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 7);

        const title = `${vaccination.pet_name} - ${vaccination.vaccine_name}接种提醒`;
        const description = `您的宠物${vaccination.pet_name}需要在${vaccination.next_due_date}前接种${vaccination.vaccine_name}疫苗`;

        db.run(
          `INSERT INTO reminders (user_id, pet_id, reminder_type, title, description, scheduled_time, notification_methods)
           VALUES (?, ?, 'vaccine', ?, ?, ?, 'app')`,
          [userId, vaccination.pet_id, title, description, reminderDate.toISOString()],
          function(err) {
            if (err) {
              console.error('创建疫苗提醒失败:', err);
              return res.status(500).json({ error: '创建提醒失败' });
            }
            res.status(201).json({
              message: '疫苗提醒创建成功',
              reminderId: this.lastID
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('创建疫苗提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取待处理的提醒（用于定时任务检查）
router.get('/check/pending', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const now = new Date().toISOString();

  try {
    db.all(
      `SELECT r.*, p.name as pet_name
       FROM reminders r
       LEFT JOIN pets p ON r.pet_id = p.id
       WHERE r.user_id = ? AND r.status = 'pending' AND r.scheduled_time <= ?
       ORDER BY r.scheduled_time ASC`,
      [userId, now],
      (err, rows) => {
        if (err) {
          console.error('获取待处理提醒失败:', err);
          return res.status(500).json({ error: '获取提醒失败' });
        }
        res.json({ reminders: rows || [] });
      }
    );
  } catch (error) {
    console.error('获取待处理提醒错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
