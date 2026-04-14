const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 获取宠物健康趋势数据
router.get('/health-trend/:petId', authenticateToken, (req, res) => {
  const { petId } = req.params;
  const { period = 'week' } = req.query; // day, week, month

  // 计算日期范围
  let days = 7; // 默认一周
  if (period === 'day') days = 1;
  else if (period === 'week') days = 7;
  else if (period === 'month') days = 30;

  const sql = `
    SELECT
      DATE(record_date) as date,
      AVG(weight) as avg_weight,
      AVG(temperature) as avg_temperature,
      COUNT(*) as record_count
    FROM health_records
    WHERE pet_id = ?
      AND record_date >= date('now', '-${days} days')
    GROUP BY DATE(record_date)
    ORDER BY date ASC
  `;

  db.all(sql, [petId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      period,
      data: rows.map(row => ({
        date: row.date,
        weight: row.avg_weight ? parseFloat(row.avg_weight.toFixed(2)) : null,
        temperature: row.avg_temperature ? parseFloat(row.avg_temperature.toFixed(1)) : null,
        count: row.record_count
      }))
    });
  });
});

// 获取活动量统计数据
router.get('/activity/:petId', authenticateToken, (req, res) => {
  const { petId } = req.params;
  const { period = 'week' } = req.query;

  let days = 7;
  if (period === 'day') days = 1;
  else if (period === 'week') days = 7;
  else if (period === 'month') days = 30;

  // 按记录类型统计活动
  const sql = `
    SELECT
      record_type as type,
      COUNT(*) as count,
      DATE(record_date) as date
    FROM health_records
    WHERE pet_id = ?
      AND record_date >= date('now', '-${days} days')
    GROUP BY record_type, DATE(record_date)
    ORDER BY date ASC
  `;

  db.all(sql, [petId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 转换为按日期分组的格式
    const dataByDate = {};
    rows.forEach(row => {
      if (!dataByDate[row.date]) {
        dataByDate[row.date] = { date: row.date };
      }
      dataByDate[row.date][row.type] = row.count;
    });

    res.json({
      period,
      data: Object.values(dataByDate)
    });
  });
});

// 获取宠物健康概览
router.get('/overview/:petId', authenticateToken, (req, res) => {
  const { petId } = req.params;

  const queries = {
    // 总健康记录数
    totalRecords: `SELECT COUNT(*) as count FROM health_records WHERE pet_id = ?`,

    // 最近一次体重
    latestWeight: `SELECT weight FROM health_records WHERE pet_id = ? AND weight IS NOT NULL ORDER BY record_date DESC LIMIT 1`,

    // 最近一次体温
    latestTemp: `SELECT temperature FROM health_records WHERE pet_id = ? AND temperature IS NOT NULL ORDER BY record_date DESC LIMIT 1`,

    // 疫苗接种数
    vaccineCount: `SELECT COUNT(*) as count FROM vaccinations WHERE pet_id = ?`,

    // 最近7天记录数
    recentRecords: `SELECT COUNT(*) as count FROM health_records WHERE pet_id = ? AND record_date >= date('now', '-7 days')`
  };

  Promise.all([
    new Promise((resolve, reject) => {
      db.get(queries.totalRecords, [petId], (err, row) => {
        if (err) reject(err);
        else resolve({ totalRecords: row.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.latestWeight, [petId], (err, row) => {
        if (err) reject(err);
        else resolve({ latestWeight: row ? row.weight : null });
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.latestTemp, [petId], (err, row) => {
        if (err) reject(err);
        else resolve({ latestTemp: row ? row.temperature : null });
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.vaccineCount, [petId], (err, row) => {
        if (err) reject(err);
        else resolve({ vaccineCount: row.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.recentRecords, [petId], (err, row) => {
        if (err) reject(err);
        else resolve({ recentRecords: row.count });
      });
    })
  ])
  .then(results => {
    const overview = Object.assign({}, ...results);
    res.json(overview);
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// 获取体重变化趋势
router.get('/weight-trend/:petId', authenticateToken, (req, res) => {
  const { petId } = req.params;
  const { period = 'month' } = req.query;

  let days = 30;
  if (period === 'week') days = 7;
  else if (period === 'month') days = 30;
  else if (period === 'year') days = 365;

  const sql = `
    SELECT
      DATE(record_date) as date,
      weight
    FROM health_records
    WHERE pet_id = ?
      AND weight IS NOT NULL
      AND record_date >= date('now', '-${days} days')
    ORDER BY record_date ASC
  `;

  db.all(sql, [petId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      period,
      data: rows.map(row => ({
        date: row.date,
        weight: parseFloat(row.weight)
      }))
    });
  });
});

module.exports = router;
