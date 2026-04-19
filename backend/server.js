const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
require('dotenv').config(); // 加载环境变量
const db = require('./database');
const { startReminderScheduler } = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(compression()); // 启用响应压缩
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload');
const statisticsRoutes = require('./routes/statistics');
const aiAnalysisRoutes = require('./routes/ai-analysis');
const reminderRoutes = require('./routes/reminders');
const medicationRoutes = require('./routes/medications');
const exportRoutes = require('./routes/export');

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/export', exportRoutes);

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '宠物健康检测系统API正常运行！' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API测试: http://localhost:${PORT}/api/test`);

  // 启动提醒定时任务
  startReminderScheduler();
});
