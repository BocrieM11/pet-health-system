const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取某个宠物的所有健康记录（支持分页）
router.get('/pet/:petId', (req, res) => {
  const { petId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // 获取总数
  db.get('SELECT COUNT(*) as total FROM health_records WHERE pet_id = ?', [petId], (err, countResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const total = countResult.total;

    // 获取分页数据
    db.all(
      'SELECT * FROM health_records WHERE pet_id = ? ORDER BY record_date DESC LIMIT ? OFFSET ?',
      [petId, limit, offset],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          records: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
    );
  });
});

// 添加健康记录
router.post('/', (req, res) => {
  const {
    pet_id, record_type, record_date, description,
    weight, temperature, heart_rate, respiratory_rate,
    blood_pressure_high, blood_pressure_low, blood_glucose,
    activity_level, appetite, mental_state, symptoms, notes
  } = req.body;

  const sql = `INSERT INTO health_records (
    pet_id, record_type, record_date, description,
    weight, temperature, heart_rate, respiratory_rate,
    blood_pressure_high, blood_pressure_low, blood_glucose,
    activity_level, appetite, mental_state, symptoms, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    pet_id, record_type, record_date, description,
    weight, temperature, heart_rate, respiratory_rate,
    blood_pressure_high, blood_pressure_low, blood_glucose,
    activity_level, appetite, mental_state, symptoms, notes
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: '健康记录添加成功',
      id: this.lastID
    });
  });
});

// 获取某个宠物的疫苗记录
router.get('/vaccinations/:petId', (req, res) => {
  const { petId } = req.params;

  db.all('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC',
    [petId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ vaccinations: rows });
  });
});

// 添加疫苗记录
router.post('/vaccinations', (req, res) => {
  const { pet_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes } = req.body;

  const sql = `INSERT INTO vaccinations (pet_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [pet_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: '疫苗记录添加成功',
      id: this.lastID
    });
  });
});

module.exports = router;
