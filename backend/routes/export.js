const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// 导出宠物健康报告为PDF
router.get('/pdf/:petId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const petId = req.params.petId;
  const { from, to } = req.query;

  try {
    // 获取宠物信息
    const pet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM pets WHERE id = ? AND user_id = ?',
        [petId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到或无权访问' });
    }

    // 获取健康记录
    let healthQuery = 'SELECT * FROM health_records WHERE pet_id = ?';
    let healthParams = [petId];

    if (from && to) {
      healthQuery += ' AND record_date BETWEEN ? AND ?';
      healthParams.push(from, to);
    }

    healthQuery += ' ORDER BY record_date DESC';

    const healthRecords = await new Promise((resolve, reject) => {
      db.all(healthQuery, healthParams, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 获取疫苗记录
    const vaccinations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // 创建PDF文档
    const doc = new PDFDocument({ margin: 50 });

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pet-health-report-${pet.name}-${Date.now()}.pdf`);

    // 将PDF输出到响应
    doc.pipe(res);

    // 添加中文字体支持（使用系统字体）
    const fontPath = 'C:\\Windows\\Fonts\\msyh.ttc'; // 微软雅黑
    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    }

    // 标题
    doc.fontSize(24).text('宠物健康报告', { align: 'center' });
    doc.moveDown();

    // 宠物基本信息
    doc.fontSize(16).text('基本信息', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`名字: ${pet.name}`);
    doc.text(`种类: ${pet.species}`);
    doc.text(`品种: ${pet.breed || '未知'}`);
    doc.text(`性别: ${pet.gender}`);
    doc.text(`出生日期: ${pet.birth_date || '未知'}`);
    doc.text(`体重: ${pet.weight ? pet.weight + ' kg' : '未知'}`);
    doc.text(`主人: ${pet.owner_name || '未知'}`);
    doc.text(`联系电话: ${pet.owner_phone || '未知'}`);
    doc.moveDown();

    // 健康记录
    if (healthRecords.length > 0) {
      doc.fontSize(16).text('健康记录', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      healthRecords.forEach((record, index) => {
        if (index > 0) doc.moveDown(0.5);

        doc.fontSize(11).text(`记录 ${index + 1} - ${record.record_date}`, { bold: true });
        doc.fontSize(10);
        doc.text(`类型: ${record.record_type}`);

        if (record.weight) doc.text(`体重: ${record.weight} kg`);
        if (record.temperature) doc.text(`体温: ${record.temperature} °C`);
        if (record.heart_rate) doc.text(`心率: ${record.heart_rate} 次/分`);
        if (record.respiratory_rate) doc.text(`呼吸频率: ${record.respiratory_rate} 次/分`);
        if (record.blood_pressure_high && record.blood_pressure_low) {
          doc.text(`血压: ${record.blood_pressure_high}/${record.blood_pressure_low} mmHg`);
        }
        if (record.blood_glucose) doc.text(`血糖: ${record.blood_glucose} mmol/L`);
        if (record.activity_level) doc.text(`活动量: ${record.activity_level}`);
        if (record.appetite) doc.text(`食欲: ${record.appetite}`);
        if (record.mental_state) doc.text(`精神状态: ${record.mental_state}`);
        if (record.description) doc.text(`描述: ${record.description}`);
        if (record.notes) doc.text(`备注: ${record.notes}`);

        // 检查是否需要换页
        if (doc.y > 700) {
          doc.addPage();
        }
      });

      doc.moveDown();
    } else {
      doc.fontSize(12).text('暂无健康记录');
      doc.moveDown();
    }

    // 疫苗记录
    if (vaccinations.length > 0) {
      // 检查是否需要换页
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.fontSize(16).text('疫苗接种记录', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      vaccinations.forEach((vac, index) => {
        if (index > 0) doc.moveDown(0.5);

        doc.fontSize(11).text(`疫苗 ${index + 1} - ${vac.vaccine_name}`, { bold: true });
        doc.fontSize(10);
        doc.text(`接种日期: ${vac.vaccination_date}`);
        if (vac.next_due_date) doc.text(`下次接种: ${vac.next_due_date}`);
        if (vac.veterinarian) doc.text(`兽医: ${vac.veterinarian}`);
        if (vac.notes) doc.text(`备注: ${vac.notes}`);
      });
    }

    // 页脚
    doc.fontSize(8).text(
      `报告生成时间: ${new Date().toLocaleString('zh-CN')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // 完成PDF
    doc.end();

  } catch (error) {
    console.error('生成PDF失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '生成PDF报告失败' });
    }
  }
});

// 导出健康记录为Excel
router.get('/excel/:petId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const petId = req.params.petId;
  const { from, to } = req.query;

  try {
    // 验证宠物所有权
    const pet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM pets WHERE id = ? AND user_id = ?',
        [petId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到或无权访问' });
    }

    // 获取健康记录
    let query = 'SELECT * FROM health_records WHERE pet_id = ?';
    let params = [petId];

    if (from && to) {
      query += ' AND record_date BETWEEN ? AND ?';
      params.push(from, to);
    }

    query += ' ORDER BY record_date DESC';

    const records = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 健康记录工作表
    const healthData = records.map(r => ({
      '日期': r.record_date,
      '类型': r.record_type,
      '体重(kg)': r.weight || '',
      '体温(°C)': r.temperature || '',
      '心率(次/分)': r.heart_rate || '',
      '呼吸频率(次/分)': r.respiratory_rate || '',
      '血压高(mmHg)': r.blood_pressure_high || '',
      '血压低(mmHg)': r.blood_pressure_low || '',
      '血糖(mmol/L)': r.blood_glucose || '',
      '活动量': r.activity_level || '',
      '食欲': r.appetite || '',
      '精神状态': r.mental_state || '',
      '症状': r.symptoms || '',
      '描述': r.description || '',
      '备注': r.notes || ''
    }));

    const healthSheet = XLSX.utils.json_to_sheet(healthData);
    XLSX.utils.book_append_sheet(workbook, healthSheet, '健康记录');

    // 获取疫苗记录
    const vaccinations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // 疫苗记录工作表
    if (vaccinations.length > 0) {
      const vaccineData = vaccinations.map(v => ({
        '疫苗名称': v.vaccine_name,
        '接种日期': v.vaccination_date,
        '下次接种日期': v.next_due_date || '',
        '兽医': v.veterinarian || '',
        '备注': v.notes || ''
      }));

      const vaccineSheet = XLSX.utils.json_to_sheet(vaccineData);
      XLSX.utils.book_append_sheet(workbook, vaccineSheet, '疫苗记录');
    }

    // 宠物信息工作表
    const petInfo = [{
      '名字': pet.name,
      '种类': pet.species,
      '品种': pet.breed || '',
      '性别': pet.gender,
      '出生日期': pet.birth_date || '',
      '体重(kg)': pet.weight || '',
      '主人姓名': pet.owner_name || '',
      '联系电话': pet.owner_phone || ''
    }];

    const petSheet = XLSX.utils.json_to_sheet(petInfo);
    XLSX.utils.book_append_sheet(workbook, petSheet, '宠物信息');

    // 生成Excel文件
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=pet-health-${pet.name}-${Date.now()}.xlsx`);

    res.send(buffer);

  } catch (error) {
    console.error('生成Excel失败:', error);
    res.status(500).json({ error: '生成Excel文件失败' });
  }
});

// 导出为CSV
router.get('/csv/:petId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const petId = req.params.petId;
  const { from, to } = req.query;

  try {
    // 验证宠物所有权
    const pet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM pets WHERE id = ? AND user_id = ?',
        [petId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到或无权访问' });
    }

    // 获取健康记录
    let query = 'SELECT * FROM health_records WHERE pet_id = ?';
    let params = [petId];

    if (from && to) {
      query += ' AND record_date BETWEEN ? AND ?';
      params.push(from, to);
    }

    query += ' ORDER BY record_date DESC';

    const records = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 创建CSV内容
    const headers = ['日期', '类型', '体重(kg)', '体温(°C)', '心率', '呼吸频率', '血压高', '血压低', '血糖', '活动量', '食欲', '精神状态', '描述', '备注'];
    const csvRows = [headers.join(',')];

    records.forEach(r => {
      const row = [
        r.record_date,
        r.record_type,
        r.weight || '',
        r.temperature || '',
        r.heart_rate || '',
        r.respiratory_rate || '',
        r.blood_pressure_high || '',
        r.blood_pressure_low || '',
        r.blood_glucose || '',
        r.activity_level || '',
        r.appetite || '',
        r.mental_state || '',
        `"${(r.description || '').replace(/"/g, '""')}"`, // 转义引号
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // 添加BOM以支持中文
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=pet-health-${pet.name}-${Date.now()}.csv`);

    res.send(csvWithBom);

  } catch (error) {
    console.error('生成CSV失败:', error);
    res.status(500).json({ error: '生成CSV文件失败' });
  }
});

// 导出所有数据（JSON格式）
router.get('/json/:petId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const petId = req.params.petId;

  try {
    // 获取宠物信息
    const pet = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM pets WHERE id = ? AND user_id = ?',
        [petId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到或无权访问' });
    }

    // 获取所有相关数据
    const healthRecords = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM health_records WHERE pet_id = ? ORDER BY record_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const vaccinations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const medications = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM medications WHERE pet_id = ? ORDER BY start_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // 组合所有数据
    const exportData = {
      pet,
      healthRecords,
      vaccinations,
      medications,
      exportDate: new Date().toISOString()
    };

    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=pet-data-${pet.name}-${Date.now()}.json`);

    res.json(exportData);

  } catch (error) {
    console.error('导出JSON失败:', error);
    res.status(500).json({ error: '导出数据失败' });
  }
});

module.exports = router;
