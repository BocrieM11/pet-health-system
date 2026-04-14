const cron = require('node-cron');
const db = require('../database');

// 定时任务：每小时检查一次待处理的提醒
function startReminderScheduler() {
  // 每小时的第0分钟执行
  cron.schedule('0 * * * *', () => {
    console.log('🔔 检查待处理的提醒...');
    checkAndProcessReminders();
  });

  // 每天检查需要自动创建的提醒
  cron.schedule('0 9 * * *', () => {
    console.log('🔔 检查疫苗提醒...');
    autoCreateVaccineReminders();
  });

  console.log('✅ 提醒定时任务已启动');
}

// 检查并处理待处理的提醒
function checkAndProcessReminders() {
  const now = new Date().toISOString();

  db.all(
    `SELECT r.*, u.email, u.username, p.name as pet_name
     FROM reminders r
     JOIN users u ON r.user_id = u.id
     LEFT JOIN pets p ON r.pet_id = p.id
     WHERE r.status = 'pending' AND r.scheduled_time <= ?`,
    [now],
    (err, reminders) => {
      if (err) {
        console.error('查询待处理提醒失败:', err);
        return;
      }

      if (!reminders || reminders.length === 0) {
        console.log('没有待处理的提醒');
        return;
      }

      console.log(`找到 ${reminders.length} 个待处理的提醒`);

      reminders.forEach(reminder => {
        processReminder(reminder);
      });
    }
  );
}

// 处理单个提醒
function processReminder(reminder) {
  console.log(`处理提醒: ${reminder.title} (用户: ${reminder.username})`);

  // 这里可以扩展发送邮件、短信等功能
  // 目前只是标记为已发送
  const methods = reminder.notification_methods || 'app';

  if (methods.includes('email')) {
    // TODO: 发送邮件
    console.log(`  - 发送邮件到: ${reminder.email}`);
  }

  if (methods.includes('sms')) {
    // TODO: 发送短信
    console.log(`  - 发送短信`);
  }

  // 标记提醒为已发送
  db.run(
    'UPDATE reminders SET status = ? WHERE id = ?',
    ['sent', reminder.id],
    (err) => {
      if (err) {
        console.error(`更新提醒状态失败 (ID: ${reminder.id}):`, err);
      } else {
        console.log(`✅ 提醒已发送: ${reminder.title}`);
      }
    }
  );
}

// 自动创建疫苗提醒
function autoCreateVaccineReminders() {
  // 查找未来30天内需要接种的疫苗，且尚未创建提醒的
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

  const today = new Date().toISOString().split('T')[0];

  db.all(
    `SELECT v.*, p.name as pet_name, p.user_id
     FROM vaccinations v
     JOIN pets p ON v.pet_id = p.id
     WHERE v.next_due_date IS NOT NULL
     AND v.next_due_date >= ?
     AND v.next_due_date <= ?
     AND NOT EXISTS (
       SELECT 1 FROM reminders r
       WHERE r.pet_id = v.pet_id
       AND r.reminder_type = 'vaccine'
       AND r.title LIKE '%' || v.vaccine_name || '%'
       AND r.status IN ('pending', 'sent')
     )`,
    [today, thirtyDaysLaterStr],
    (err, vaccinations) => {
      if (err) {
        console.error('查询待创建疫苗提醒失败:', err);
        return;
      }

      if (!vaccinations || vaccinations.length === 0) {
        console.log('没有需要创建的疫苗提醒');
        return;
      }

      console.log(`找到 ${vaccinations.length} 个需要创建提醒的疫苗`);

      vaccinations.forEach(vaccination => {
        createVaccineReminder(vaccination);
      });
    }
  );
}

// 创建疫苗提醒
function createVaccineReminder(vaccination) {
  const dueDate = new Date(vaccination.next_due_date);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 7); // 提前7天提醒

  const title = `${vaccination.pet_name} - ${vaccination.vaccine_name}接种提醒`;
  const description = `您的宠物${vaccination.pet_name}需要在${vaccination.next_due_date}前接种${vaccination.vaccine_name}疫苗`;

  db.run(
    `INSERT INTO reminders (user_id, pet_id, reminder_type, title, description, scheduled_time, notification_methods)
     VALUES (?, ?, 'vaccine', ?, ?, ?, 'app')`,
    [vaccination.user_id, vaccination.pet_id, title, description, reminderDate.toISOString()],
    function(err) {
      if (err) {
        console.error(`创建疫苗提醒失败 (${vaccination.vaccine_name}):`, err);
      } else {
        console.log(`✅ 已创建疫苗提醒: ${title}`);
      }
    }
  );
}

// 检查异常健康指标并创建预警
function checkHealthAnomalies() {
  // 查找最近24小时内的异常健康记录
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString();

  db.all(
    `SELECT h.*, p.name as pet_name, p.user_id, p.species
     FROM health_records h
     JOIN pets p ON h.pet_id = p.id
     WHERE h.created_at >= ?`,
    [yesterdayStr],
    (err, records) => {
      if (err) {
        console.error('查询健康记录失败:', err);
        return;
      }

      records.forEach(record => {
        checkRecordAnomalies(record);
      });
    }
  );
}

// 检查单条记录的异常
function checkRecordAnomalies(record) {
  const anomalies = [];

  // 检查体温
  if (record.temperature) {
    if (record.temperature < 37.5 || record.temperature > 39.5) {
      anomalies.push({
        type: '体温异常',
        value: record.temperature,
        normal: '37.5-39.5°C'
      });
    }
  }

  // 检查血糖
  if (record.blood_glucose) {
    if (record.blood_glucose < 3.9 || record.blood_glucose > 6.9) {
      anomalies.push({
        type: '血糖异常',
        value: record.blood_glucose,
        normal: '3.9-6.9 mmol/L'
      });
    }
  }

  // 检查精神状态
  if (record.mental_state === '萎靡' || record.mental_state === '昏迷') {
    anomalies.push({
      type: '精神状态异常',
      value: record.mental_state,
      normal: '正常'
    });
  }

  // 如果有异常，创建预警提醒
  if (anomalies.length > 0) {
    createHealthAlert(record, anomalies);
  }
}

// 创建健康预警
function createHealthAlert(record, anomalies) {
  const title = `${record.pet_name} - 健康指标异常预警`;
  const description = `检测到以下异常指标：\n${anomalies.map(a => `- ${a.type}: ${a.value} (正常范围: ${a.normal})`).join('\n')}`;

  // 检查是否已经有相似的预警（避免重复）
  db.get(
    `SELECT id FROM reminders
     WHERE user_id = ? AND pet_id = ?
     AND reminder_type = 'alert'
     AND title = ?
     AND status = 'pending'
     AND created_at >= datetime('now', '-1 day')`,
    [record.user_id, record.pet_id, title],
    (err, existing) => {
      if (err) {
        console.error('查询已有预警失败:', err);
        return;
      }

      if (existing) {
        console.log(`预警已存在，跳过: ${title}`);
        return;
      }

      // 立即提醒（scheduled_time为当前时间）
      db.run(
        `INSERT INTO reminders (user_id, pet_id, reminder_type, title, description, scheduled_time, notification_methods)
         VALUES (?, ?, 'alert', ?, ?, datetime('now'), 'app')`,
        [record.user_id, record.pet_id, title, description],
        function(err) {
          if (err) {
            console.error('创建健康预警失败:', err);
          } else {
            console.log(`⚠️ 已创建健康预警: ${title}`);
          }
        }
      );
    }
  );
}

module.exports = {
  startReminderScheduler,
  checkAndProcessReminders,
  autoCreateVaccineReminders,
  checkHealthAnomalies
};
