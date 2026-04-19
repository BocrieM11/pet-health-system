const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 获取所有宠物（可选认证，如果登录则只显示自己的）
router.get('/', optionalAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM pets';
    let params = [];

    // 如果用户已登录，返回该用户的宠物和未分配的宠物
    if (req.user) {
      sql += ' WHERE (user_id = ? OR user_id IS NULL)';
      params.push(req.user.id);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await db.all(sql, params);
    res.json({ pets: rows });
  } catch (err) {
    console.error('获取宠物列表错误:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取单个宠物信息
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const row = await db.get('SELECT * FROM pets WHERE id = ?', [id]);

    if (!row) {
      return res.status(404).json({ error: '宠物未找到' });
    }

    // 如果用户已登录，检查权限
    if (req.user && row.user_id && row.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权访问此宠物信息' });
    }

    res.json({ pet: row });
  } catch (err) {
    console.error('获取宠物详情错误:', err);
    res.status(500).json({ error: err.message });
  }
});

// 添加新宠物（需要登录）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, species, breed, gender, birth_date, weight, avatar, owner_name, owner_phone } = req.body;

    if (!name || !species) {
      return res.status(400).json({ error: '宠物名字和种类不能为空' });
    }

    const sql = `INSERT INTO pets (user_id, name, species, breed, gender, birth_date, weight, avatar, owner_name, owner_phone)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const result = await db.run(sql, [req.user.id, name, species, breed, gender, birth_date, weight, avatar, owner_name, owner_phone]);

    res.json({
      message: '宠物信息添加成功',
      id: result.lastID
    });
  } catch (err) {
    console.error('添加宠物错误:', err);
    res.status(500).json({ error: err.message });
  }
});

// 更新宠物信息（需要登录且只能更新自己的宠物）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, breed, gender, birth_date, weight, avatar, owner_name, owner_phone } = req.body;

    // 先检查宠物是否属于当前用户
    const pet = await db.get('SELECT * FROM pets WHERE id = ?', [id]);

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到' });
    }
    if (pet.user_id && pet.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权修改此宠物信息' });
    }

    const sql = `UPDATE pets SET name = ?, species = ?, breed = ?, gender = ?,
                 birth_date = ?, weight = ?, avatar = ?, owner_name = ?, owner_phone = ? WHERE id = ?`;

    await db.run(sql, [name, species, breed, gender, birth_date, weight, avatar, owner_name, owner_phone, id]);

    res.json({ message: '宠物信息更新成功' });
  } catch (err) {
    console.error('更新宠物错误:', err);
    res.status(500).json({ error: err.message });
  }
});

// 删除宠物（需要登录且只能删除自己的宠物）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 先检查宠物是否属于当前用户
    const pet = await db.get('SELECT * FROM pets WHERE id = ?', [id]);

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到' });
    }
    if (pet.user_id && pet.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权删除此宠物' });
    }

    await db.run('DELETE FROM pets WHERE id = ?', [id]);

    res.json({ message: '宠物信息删除成功' });
  } catch (err) {
    console.error('删除宠物错误:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
