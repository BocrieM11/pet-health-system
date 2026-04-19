const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// AI分析 - 分析宠物健康数据
router.post('/analyze/:petId', authenticateToken, async (req, res) => {
  const { petId } = req.params;
  const userId = req.user.id; // 修复：JWT中的字段名是id，不是userId

  try {
    // 验证宠物所有权（允许访问user_id为NULL的旧数据）
    const pet = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM pets WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [petId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到或无权访问' });
    }

    // 获取宠物的所有健康记录
    const healthRecords = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM health_records
         WHERE pet_id = ?
         ORDER BY record_date DESC
         LIMIT 30`,
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // 获取疫苗记录
    const vaccinations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC',
        [petId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (healthRecords.length === 0) {
      return res.json({
        analysis: {
          summary: '暂无足够的健康数据进行分析。建议定期记录宠物的健康状况，以便进行更准确的健康评估。',
          healthScore: null,
          trends: [],
          warnings: [],
          recommendations: [
            '开始记录宠物的日常体重和体温',
            '定期进行健康检查',
            '记录宠物的食欲和活动量变化'
          ]
        }
      });
    }

    // 调用AI分析
    const analysis = await analyzeHealthData(pet, healthRecords, vaccinations);

    res.json({ analysis });

  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({ error: 'AI分析失败，请重试' });
  }
});

// AI分析函数
async function analyzeHealthData(pet, healthRecords, vaccinations) {
  // 检查是否配置了API密钥
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // 如果没有配置API密钥，返回基于规则的分析
    return ruleBasedAnalysis(pet, healthRecords, vaccinations);
  }

  try {
    // 动态导入Anthropic SDK
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    // 准备数据摘要
    const dataSummary = prepareDataSummary(pet, healthRecords, vaccinations);

    // 调用Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `你是一位专业的宠物健康分析专家。请分析以下宠物的健康数据，并提供详细的健康评估报告。

宠物基本信息：
- 名字：${pet.name}
- 种类：${pet.species}
- 品种：${pet.breed || '未知'}
- 性别：${pet.gender}
- 出生日期：${pet.birth_date || '未知'}

${dataSummary}

请提供以下内容（以JSON格式返回）：
1. summary: 整体健康状况总结（100-200字）
2. healthScore: 健康评分（0-100分）
3. trends: 发现的健康趋势数组，每项包含{type: 趋势类型, description: 描述, severity: 严重程度(low/medium/high)}
4. warnings: 健康预警数组，每项包含{title: 标题, description: 描述, urgency: 紧急程度(low/medium/high)}
5. recommendations: 健康建议数组（字符串数组，3-5条具体建议）

请确保分析专业、准确，并提供实用的建议。只返回JSON对象，不要包含其他文字。`
      }]
    });

    // 解析AI返回的结果
    const aiResponse = message.content[0].text;

    // 尝试解析JSON
    let analysis;
    try {
      // 提取JSON部分（如果AI返回了额外的文字）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法提取JSON');
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      // 如果解析失败，使用基于规则的分析
      return ruleBasedAnalysis(pet, healthRecords, vaccinations);
    }

    return analysis;

  } catch (error) {
    console.error('Claude API调用错误:', error);
    // 如果API调用失败，降级使用基于规则的分析
    return ruleBasedAnalysis(pet, healthRecords, vaccinations);
  }
}

// 准备数据摘要
function prepareDataSummary(pet, healthRecords, vaccinations) {
  let summary = '最近的健康记录：\n';

  // 只取最近10条记录
  const recentRecords = healthRecords.slice(0, 10);

  recentRecords.forEach((record, index) => {
    summary += `\n记录${index + 1}（${record.record_date}）：\n`;
    summary += `- 类型：${record.record_type}\n`;
    if (record.weight) summary += `- 体重：${record.weight} kg\n`;
    if (record.temperature) summary += `- 体温：${record.temperature} °C\n`;
    if (record.heart_rate) summary += `- 心率：${record.heart_rate} 次/分\n`;
    if (record.respiratory_rate) summary += `- 呼吸频率：${record.respiratory_rate} 次/分\n`;
    if (record.blood_pressure_high && record.blood_pressure_low) {
      summary += `- 血压：${record.blood_pressure_high}/${record.blood_pressure_low} mmHg\n`;
    }
    if (record.blood_glucose) summary += `- 血糖：${record.blood_glucose} mmol/L\n`;
    if (record.activity_level) summary += `- 活动量：${record.activity_level}\n`;
    if (record.appetite) summary += `- 食欲：${record.appetite}\n`;
    if (record.mental_state) summary += `- 精神状态：${record.mental_state}\n`;
    if (record.symptoms) summary += `- 症状：${record.symptoms}\n`;
    if (record.description) summary += `- 描述：${record.description}\n`;
  });

  if (vaccinations.length > 0) {
    summary += '\n\n疫苗接种记录：\n';
    vaccinations.forEach((vac, index) => {
      summary += `${index + 1}. ${vac.vaccine_name}（${vac.vaccination_date}）\n`;
      if (vac.next_due_date) summary += `   下次接种：${vac.next_due_date}\n`;
    });
  }

  return summary;
}

// 基于规则的分析（当AI不可用时）
function ruleBasedAnalysis(pet, healthRecords, vaccinations) {
  const analysis = {
    summary: '',
    healthScore: 0,
    trends: [],
    warnings: [],
    recommendations: []
  };

  const latestRecord = healthRecords[0];
  let scoreDeductions = 0;

  // 分析体重趋势
  const weightRecords = healthRecords.filter(r => r.weight).slice(0, 5);
  if (weightRecords.length >= 2) {
    const weightChange = weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight;
    const changePercent = (weightChange / weightRecords[weightRecords.length - 1].weight) * 100;

    if (Math.abs(changePercent) > 10) {
      analysis.trends.push({
        type: '体重变化',
        description: `体重${weightChange > 0 ? '增加' : '减少'}了${Math.abs(changePercent).toFixed(1)}%`,
        severity: Math.abs(changePercent) > 15 ? 'high' : 'medium'
      });
      scoreDeductions += Math.abs(changePercent) > 15 ? 15 : 10;
    }
  }

  // 分析体温
  if (latestRecord.temperature) {
    const temp = latestRecord.temperature;
    if (temp < 37.5 || temp > 39.5) {
      analysis.warnings.push({
        title: '体温异常',
        description: `最近一次体温为${temp}°C，${temp < 37.5 ? '偏低' : '偏高'}。正常范围应为37.5-39.5°C`,
        urgency: temp < 37 || temp > 40 ? 'high' : 'medium'
      });
      scoreDeductions += temp < 37 || temp > 40 ? 20 : 10;
    }
  }

  // 分析心率
  if (latestRecord.heart_rate) {
    const hr = latestRecord.heart_rate;
    const species = pet.species.toLowerCase();
    let normalRange = { min: 60, max: 140 };

    if (species.includes('猫')) {
      normalRange = { min: 120, max: 140 };
    }

    if (hr < normalRange.min || hr > normalRange.max) {
      analysis.warnings.push({
        title: '心率异常',
        description: `心率为${hr}次/分钟，${hr < normalRange.min ? '偏低' : '偏高'}`,
        urgency: 'medium'
      });
      scoreDeductions += 10;
    }
  }

  // 分析血糖
  if (latestRecord.blood_glucose) {
    const glucose = latestRecord.blood_glucose;
    if (glucose < 3.9 || glucose > 6.9) {
      analysis.warnings.push({
        title: '血糖异常',
        description: `血糖为${glucose} mmol/L，${glucose < 3.9 ? '偏低' : '偏高'}。正常范围：3.9-6.9 mmol/L`,
        urgency: glucose < 3.0 || glucose > 10 ? 'high' : 'medium'
      });
      scoreDeductions += glucose < 3.0 || glucose > 10 ? 20 : 15;
    }
  }

  // 分析状态
  if (latestRecord.appetite === '拒食' || latestRecord.appetite === '偏差') {
    analysis.warnings.push({
      title: '食欲不振',
      description: '最近食欲状况不佳，需要密切关注',
      urgency: latestRecord.appetite === '拒食' ? 'high' : 'medium'
    });
    scoreDeductions += latestRecord.appetite === '拒食' ? 15 : 10;
  }

  if (latestRecord.mental_state === '萎靡' || latestRecord.mental_state === '昏迷') {
    analysis.warnings.push({
      title: '精神状态异常',
      description: `精神状态${latestRecord.mental_state}，建议尽快就医`,
      urgency: latestRecord.mental_state === '昏迷' ? 'high' : 'high'
    });
    scoreDeductions += latestRecord.mental_state === '昏迷' ? 30 : 20;
  }

  if (latestRecord.activity_level === '嗜睡') {
    analysis.warnings.push({
      title: '活动量异常',
      description: '活动量明显减少，表现为嗜睡',
      urgency: 'medium'
    });
    scoreDeductions += 10;
  }

  // 检查疫苗
  if (vaccinations.length === 0) {
    analysis.recommendations.push('尚无疫苗接种记录，建议咨询兽医制定疫苗接种计划');
  } else {
    const needsVaccine = vaccinations.some(v => {
      if (v.next_due_date) {
        const dueDate = new Date(v.next_due_date);
        const today = new Date();
        return dueDate <= today;
      }
      return false;
    });

    if (needsVaccine) {
      analysis.warnings.push({
        title: '疫苗接种提醒',
        description: '有疫苗需要接种，请查看疫苗记录',
        urgency: 'low'
      });
    }
  }

  // 计算健康评分
  analysis.healthScore = Math.max(0, Math.min(100, 100 - scoreDeductions));

  // 生成总结
  if (analysis.healthScore >= 80) {
    analysis.summary = `${pet.name}目前整体健康状况良好，各项指标基本正常。请继续保持定期健康检查和记录的好习惯。`;
  } else if (analysis.healthScore >= 60) {
    analysis.summary = `${pet.name}的健康状况一般，发现了一些需要注意的问题。建议关注异常指标的变化趋势，必要时咨询兽医。`;
  } else {
    analysis.summary = `${pet.name}的健康状况需要引起重视，发现了多个异常指标。强烈建议尽快带宠物就医进行全面检查。`;
  }

  // 通用建议
  if (!analysis.recommendations.includes('定期记录体重和体温变化')) {
    analysis.recommendations.push('定期记录体重和体温变化');
  }
  if (!analysis.recommendations.includes('保持均衡饮食和适量运动')) {
    analysis.recommendations.push('保持均衡饮食和适量运动');
  }
  if (analysis.warnings.length > 0) {
    analysis.recommendations.push('针对异常指标，建议咨询专业兽医');
  }
  if (!analysis.recommendations.includes('定期进行全面健康体检')) {
    analysis.recommendations.push('定期进行全面健康体检');
  }

  return analysis;
}

module.exports = router;
