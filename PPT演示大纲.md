# 宠物健康管理系统 - PPT演示大纲

## 完整PPT结构（共25页）

---

### 【第1页】封面页
**内容：**
- 项目标题：宠物健康管理系统 (Pet Health Management System)
- 副标题：基于React + Node.js的全栈Web应用
- 版本号：v2.3.0
- 演讲人姓名
- 日期：2026年4月
- 背景图：宠物相关的温馨图片

**设计建议：** 简洁大气，使用渐变色背景（蓝色到紫色渐变）

---

### 【第2页】目录页
**内容：**
1. 项目概述
2. 技术架构
3. 前端设计与实现
4. 后端设计与实现
5. 数据库设计
6. 核心功能演示
7. 技术亮点
8. 项目总结

**设计建议：** 列表式展示，可以使用图标

---

## 第一部分：项目概述（3页）

### 【第3页】项目背景与需求
**内容：**
- **项目背景**
  - 宠物饲养普及，健康管理需求增加
  - 传统纸质记录易丢失、不便查询
  - 缺乏系统化的健康数据分析工具

- **核心需求**
  - 多宠物信息管理
  - 健康数据记录与追踪
  - 数据可视化分析
  - 智能提醒功能
  - 数据导出与分享

**可视化元素：** 问题痛点图示、用户需求脑图

---

### 【第4页】项目功能概览
**内容：**
- **七大核心模块**
  1. 用户认证系统 - 注册/登录/权限管理
  2. 宠物档案管理 - CRUD操作、头像上传
  3. 健康记录追踪 - 体征数据、疫苗记录
  4. AI智能分析 - 健康评分、风险预警
  5. 数据可视化 - 趋势图表、统计分析
  6. 提醒系统 - 定时任务、自动通知
  7. 数据导出 - PDF/Excel报告生成

**可视化元素：** 功能模块图、系统架构图

---

### 【第5页】项目特色与创新点
**内容：**
- **技术创新**
  - 集成Anthropic Claude AI进行健康分析
  - 使用Recharts实现交互式数据可视化
  - Node-cron实现自动化提醒系统

- **用户体验创新**
  - 渐变式现代UI设计
  - 实时头像预览上传
  - 一键导出健康报告

- **架构创新**
  - 前后端完全分离
  - JWT无状态认证
  - SQLite轻量级部署

**可视化元素：** 特色功能截图

---

## 第二部分：技术架构（4页）

### 【第6页】整体技术架构
**内容：**
- **系统架构图**
```
┌─────────────┐     HTTP/REST     ┌─────────────┐
│   React     │ ←────────────────→ │  Express    │
│  Frontend   │      API calls     │   Backend   │
│  (Port 3000)│                    │ (Port 3001) │
└─────────────┘                    └──────┬──────┘
                                          │
                                    ┌─────▼──────┐
                                    │   SQLite   │
                                    │  Database  │
                                    └────────────┘
```

- **技术选型理由**
  - React：组件化开发、生态丰富
  - Express：轻量灵活、中间件丰富
  - SQLite：零配置、文件型数据库

**可视化元素：** 架构流程图

---

### 【第7页】前端技术栈
**内容：**
| 技术/库 | 版本 | 用途 |
|---------|------|------|
| React | 18.x | UI框架 |
| Vite | 5.x | 构建工具 |
| React Router DOM | 6.x | 路由管理 |
| Axios | 1.x | HTTP客户端 |
| Recharts | 2.x | 数据可视化 |

- **开发工具**
  - ES6+ 语法
  - CSS3 渐变与动画
  - 响应式设计

**可视化元素：** 技术栈徽章/Logo组合

---

### 【第8页】后端技术栈
**内容：**
| 技术/库 | 版本 | 用途 |
|---------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.x | Web框架 |
| SQLite3 | 5.x | 数据库 |
| jsonwebtoken | 9.x | JWT认证 |
| bcryptjs | 2.x | 密码加密 |
| multer | 1.x | 文件上传 |
| node-cron | 3.x | 定时任务 |
| pdfkit | 0.x | PDF生成 |
| xlsx | 0.x | Excel导出 |
| @anthropic-ai/sdk | 0.x | AI分析 |

**可视化元素：** 技术栈图标矩阵

---

### 【第9页】项目目录结构
**内容：**
```
pet-health-system/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── pages/        # 9个页面组件
│   │   ├── components/   # 可复用组件
│   │   ├── services/     # API服务
│   │   └── App.jsx       # 路由配置
│   └── vite.config.js    # Vite配置
│
├── backend/               # 后端项目
│   ├── routes/           # 9个路由模块
│   ├── middleware/       # 认证中间件
│   ├── services/         # 业务服务
│   ├── database.js       # 数据库初始化
│   └── server.js         # 服务器入口
│
├── docs/                  # 文档目录
└── scripts/               # 启动脚本
```

**可视化元素：** 树形目录图

---

## 第三部分：前端设计与实现（5页）

### 【第10页】前端架构设计
**内容：**
- **组件化设计**
  - 页面组件（9个）：Login、Register、PetList、PetDetail等
  - 功能组件（3个）：AvatarUpload、HealthTrendChart、ActivityChart
  - 组件复用率：85%+

- **路由设计**
```javascript
/                    → PetList (首页)
/login               → Login
/register            → Register
/pets/:id            → PetDetail
/add-pet             → AddPet
/health-record/:petId → HealthRecordForm
/statistics          → Statistics
/ai-analysis/:petId  → AIAnalysis
/reminders           → Reminders
```

**可视化元素：** 组件树状图、路由流程图

---

### 【第11页】前端核心功能实现（一）
**内容：**

**1. 用户认证流程**
```javascript
// Token自动注入（Axios拦截器）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401自动跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**2. API服务封装**
- authAPI：登录/注册
- petAPI：宠物CRUD
- healthAPI：健康记录
- aiAPI：AI分析
- exportAPI：数据导出

**可视化元素：** 代码截图、流程图

---

### 【第12页】前端核心功能实现（二）
**内容：**

**3. 头像上传组件**
```javascript
// AvatarUpload.jsx
- 图片预览功能
- 大小限制（5MB）
- 格式验证（JPG/PNG/GIF）
- 实时反馈
```

**4. 数据可视化组件**
```javascript
// HealthTrendChart.jsx (使用Recharts)
- 折线图展示体重/体温趋势
- 时间范围选择（日/周/月）
- 交互式tooltips
- 响应式图表尺寸

// ActivityChart.jsx
- 柱状图展示活动分布
- 颜色编码（高/中/低活动）
```

**可视化元素：** 组件效果截图

---

### 【第13页】前端核心功能实现（三）
**内容：**

**5. 统计页面设计**
```javascript
// Statistics.jsx 核心功能
- 多宠物数据对比
- 并行API请求（Promise.all）
- 时间段切换
- 实时数据刷新
```

**6. 表单验证**
- 客户端实时验证
- 错误提示反馈
- 必填项标识
- 数据格式校验

**7. 响应式设计**
- 移动端适配
- 弹性布局
- 媒体查询

**可视化元素：** 多设备展示截图

---

### 【第14页】前端UI设计特色
**内容：**

**视觉设计**
- 渐变色主题（蓝紫渐变）
- 卡片式布局
- 阴影与圆角设计
- 平滑过渡动画

**交互设计**
- Loading状态反馈
- 按钮悬停效果
- 表单聚焦样式
- 成功/错误提示

**用户体验优化**
- 面包屑导航
- 快速操作按钮
- 数据加载骨架屏
- 友好的错误提示

**可视化元素：** UI设计截图集合

---

## 第四部分：后端设计与实现（5页）

### 【第15页】后端架构设计
**内容：**

**分层架构**
```
┌──────────────────┐
│   Routes层       │ ← 路由定义、参数验证
├──────────────────┤
│  Middleware层    │ ← JWT验证、错误处理
├──────────────────┤
│   Service层      │ ← 业务逻辑、定时任务
├──────────────────┤
│   Database层     │ ← 数据访问、SQL操作
└──────────────────┘
```

**9大路由模块**
1. auth.js - 认证路由
2. pets.js - 宠物管理
3. health.js - 健康记录
4. upload.js - 文件上传
5. statistics.js - 数据统计
6. ai-analysis.js - AI分析
7. reminders.js - 提醒管理
8. medications.js - 用药记录
9. export.js - 数据导出

**可视化元素：** 架构层次图

---

### 【第16页】后端核心功能实现（一）
**内容：**

**1. JWT认证机制**
```javascript
// 生成Token（7天有效期）
const token = jwt.sign(
  { userId: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// 验证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未授权' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: '无效令牌' });
    req.user = user;
    next();
  });
};
```

**2. 密码安全**
```javascript
// 注册时加密（10轮盐值）
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时验证
const isValid = await bcrypt.compare(password, user.password);
```

**可视化元素：** 认证流程时序图

---

### 【第17页】后端核心功能实现（二）
**内容：**

**3. 文件上传处理**
```javascript
// Multer配置
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(file.mimetype);
    cb(null, isValid);
  }
});
```

**4. 数据隔离**
```javascript
// 确保用户只能访问自己的数据
WHERE user_id = ? AND id = ?
```

**可视化元素：** 上传流程图

---

### 【第18页】后端核心功能实现（三）
**内容：**

**5. AI健康分析集成**
```javascript
// Anthropic Claude API调用
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: `分析宠物健康数据：${healthData}`
  }]
});

// 降级策略：API不可用时使用规则引擎
if (!apiKey) {
  return ruleBasedAnalysis(healthRecords);
}
```

**功能特性**
- 健康评分计算
- 异常指标识别
- 个性化建议生成
- 趋势分析预测

**可视化元素：** AI分析流程图

---

### 【第19页】后端核心功能实现（四）
**内容：**

**6. 定时任务系统**
```javascript
// Node-cron配置
// 每小时检查待处理提醒
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const pendingReminders = await getPendingReminders(now);
  
  for (const reminder of pendingReminders) {
    await processReminder(reminder);
    await updateReminderStatus(reminder.id, 'completed');
  }
});

// 每日凌晨1点清理过期数据
cron.schedule('0 1 * * *', async () => {
  await cleanupExpiredReminders();
});
```

**7. PDF/Excel导出**
```javascript
// PDFKit生成报告
const doc = new PDFDocument();
doc.text('宠物健康报告', { align: 'center' });
doc.pipe(res);

// XLSX生成表格
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet);
```

**可视化元素：** 定时任务时间轴、导出样例

---

## 第五部分：数据库设计（2页）

### 【第20页】数据库表结构设计
**内容：**

**ER关系图**
```
users (用户表)
  ├── pets (宠物表) [1:N]
      ├── health_records (健康记录) [1:N]
      ├── vaccinations (疫苗记录) [1:N]
      ├── medications (用药记录) [1:N]
      └── reminders (提醒) [1:N]
```

**核心表结构**

**1. users - 用户表**
- id (主键)
- username (唯一索引)
- email (唯一索引)
- password (bcrypt哈希)
- created_at

**2. pets - 宠物表**
- id (主键)
- user_id (外键) + 索引
- name, species, breed, gender
- birth_date, weight, avatar
- owner_name, owner_phone
- created_at

**可视化元素：** ER关系图

---

### 【第21页】数据库优化设计
**内容：**

**3. health_records - 健康记录表**
```sql
CREATE INDEX idx_health_records_pet_date 
ON health_records(pet_id, record_date DESC);
```
- 字段：体重、体温、心率、呼吸率、血压、血糖
- 活动水平、食欲、精神状态、症状、备注
- 复合索引优化查询性能

**4. reminders - 提醒表**
```sql
CREATE INDEX idx_reminders_schedule 
ON reminders(scheduled_time, status);
```
- 支持定时任务快速查询
- 状态管理（pending/completed）

**性能优化策略**
- 索引优化（3个关键索引）
- Promise化异步操作
- 连接池管理
- 批量操作优化

**可视化元素：** 表结构详细图、索引性能对比图

---

## 第六部分：功能演示（2页）

### 【第22页】核心功能演示流程
**内容：**

**完整用户流程**
1. **注册/登录** → 获取JWT Token
2. **添加宠物** → 上传头像、填写信息
3. **记录健康数据** → 输入体征指标
4. **查看数据可视化** → 趋势图、统计图表
5. **AI健康分析** → 获取智能建议
6. **设置提醒** → 创建疫苗/体检提醒
7. **导出报告** → 生成PDF/Excel

**演示要点**
- 操作流畅性
- 数据实时性
- UI响应速度
- 错误处理

**可视化元素：** 功能演示截图序列

---

### 【第23页】实际应用场景
**内容：**

**场景1：新宠物入档**
- 录入基本信息 → 上传照片 → 建立首次健康档案

**场景2：定期体检记录**
- 添加体检数据 → 查看健康趋势 → AI分析建议

**场景3：疫苗管理**
- 记录接种信息 → 自动生成下次提醒 → 定时通知

**场景4：数据导出分享**
- 选择时间范围 → 导出PDF → 分享给兽医

**应用价值**
- 提高宠物健康管理效率
- 数据化追踪健康状况
- 预防性健康管理
- 便于与兽医沟通

**可视化元素：** 实际使用场景插画

---

## 第七部分：技术亮点与总结（2页）

### 【第24页】技术亮点总结
**内容：**

**前端亮点**
✅ React Hooks现代化开发
✅ Axios拦截器自动Token管理
✅ Recharts交互式数据可视化
✅ 实时预览上传功能
✅ 响应式设计（移动端适配）

**后端亮点**
✅ JWT无状态认证
✅ 分层架构设计
✅ Node-cron自动化任务
✅ AI集成（Claude API）
✅ 多格式导出（PDF/Excel）
✅ 数据库索引优化

**工程化亮点**
✅ 前后端完全分离
✅ RESTful API设计
✅ 环境变量配置
✅ 错误统一处理
✅ 完整文档支持
✅ Windows批处理脚本

**可视化元素：** 亮点徽章墙

---

### 【第25页】项目总结与展望
**内容：**

**项目成果**
- ✅ 完整的全栈Web应用
- ✅ 7大核心功能模块
- ✅ 6张数据库表设计
- ✅ 9个前端页面组件
- ✅ 9个后端路由模块
- ✅ 支持AI智能分析
- ✅ 数据可视化与导出

**技术收获**
- React全家桶实战经验
- Node.js后端开发能力
- 数据库设计与优化
- API设计最佳实践
- 项目工程化管理

**未来展望**
- 🚀 移动端APP开发
- 🚀 多用户协作功能
- 🚀 社区分享平台
- 🚀 智能健康预警
- 🚀 云端数据同步
- 🚀 多语言国际化

**可视化元素：** 路线图、Thank You页面

---

## 演示建议

### 时间分配（30分钟演讲）
- 项目概述（5分钟）
- 技术架构（5分钟）
- 前端实现（7分钟）
- 后端实现（7分钟）
- 数据库设计（3分钟）
- 功能演示（5分钟）
- 总结与Q&A（3分钟）

### 演示技巧
1. 提前准备Live Demo环境
2. 准备备用录屏视频（防止现场演示故障）
3. 代码部分使用语法高亮
4. 关键数据使用动画效果
5. 准备常见问题的回答

### PPT设计风格建议
- 主色调：蓝色（#4A90E2）+ 紫色（#9013FE）渐变
- 字体：标题用微软雅黑粗体，正文用微软雅黑
- 代码字体：Consolas / Fira Code
- 图表统一使用现代扁平化风格
- 每页不超过3个要点
- 多用图表、少用纯文字

---

## 附加资料准备清单

✅ 系统架构图（高清版）
✅ 数据库ER图
✅ API接口文档
✅ 核心代码片段（已格式化）
✅ 功能演示视频（3-5分钟）
✅ 项目GitHub链接/二维码
✅ 技术栈版本清单
✅ 性能测试数据
✅ 用户反馈截图
✅ Q&A准备文档
