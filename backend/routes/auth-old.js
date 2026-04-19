const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // 验证输入
  if (!username || !email || !password) {
    return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }

  try {
    // 检查用户名是否已存在
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: '服务器错误' });
      }

      if (user) {
        return res.status(400).json({ error: '用户名或邮箱已被注册' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.run(sql, [username, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: '注册失败' });
        }

        // 生成Token
        const token = jwt.sign(
          { id: this.lastID, username, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: '注册成功',
          token,
          user: {
            id: this.lastID,
            username,
            email
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // 查找用户
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  });
});

module.exports = router;
