# 🐾 宠物健康管理系统 - 后端技术分享

> Pet Health Management System - Backend Architecture Presentation
> 
> 演讲时长：约4分钟
> 页数：8页

---

## 📊 PPT 每页内容大纲

### 第1页：封面 (10秒)

```
宠物健康管理系统
Backend 技术架构

Pet Health Management System
Backend Architecture

演讲人：[你的姓名]
日期：[日期]

[建议添加：系统logo或宠物相关图标]
```

---

### 第2页：系统概览 (30秒)

```
系统概览 System Overview

🎯 核心功能
• 用户认证与权限管理
• 宠物档案管理
• 健康记录追踪
• 数据可视化统计
• AI智能分析
• 提醒与导出功能

📊 技术指标
• RESTful API设计
• JWT安全认证
• 完整的数据隔离
• 高性能优化
```

**视觉建议：**
- 左侧：功能列表配图标
- 右侧：技术指标配图表或架构图

---

### 第3页：技术栈 (35秒)

```
技术栈 Technology Stack

🔧 核心技术
• Node.js + Express     —— Web服务框架
• SQLite3               —— 轻量级数据库
• JWT                   —— 用户认证
• Bcrypt                —— 密码加密

📦 扩展功能
• Multer                —— 文件上传
• Anthropic AI SDK      —— AI健康分析
• PDFKit + XLSX         —— 数据导出
• node-cron             —— 定时任务
• Compression           —— 性能优化
```

**视觉建议：**
- 使用技术logo图标（Node.js、Express等）
- 两列布局：核心技术 | 扩展功能

---

### 第4页：数据库设计 (30秒)

```
数据库架构 Database Schema

📊 六大核心表设计

┌─────────────────────────────────────┐
│  users (用户表)                      │
│  └─ 用户认证信息、JWT Token管理       │
└─────────────────────────────────────┘
           │
           ├── pets (宠物表)
           │   └─ 宠物档案、多对一用户关联
           │
           ├── health_records (健康记录)
           │   └─ 体重、体温、心率、血压等9+项健康指标
           │
           ├── vaccinations (疫苗记录)
           │
           ├── reminders (智能提醒)
           │
           └── medications (用药记录)

✨ 性能优化：8个索引加速查询
   • idx_pets_user_id
   • idx_health_records_pet_id
   • idx_health_records_date
   • idx_health_pet_date
   • 等...
```

**视觉建议：**
- 使用ER图或表关系图
- 高亮外键关联关系

---

### 第5页：API架构设计 (35秒)

```
RESTful API 架构

🔐 认证模块 /api/auth
• POST /register  - 用户注册（bcrypt加密）
• POST /login     - JWT登录（7天有效期）
• GET  /me        - 获取当前用户

🐾 宠物管理 /api/pets
• GET    /pets          - 获取宠物列表
• GET    /pets/:id      - 获取单个宠物
• POST   /pets          - 添加宠物 🔒
• PUT    /pets/:id      - 更新宠物 🔒
• DELETE /pets/:id      - 删除宠物 🔒
▶ 数据隔离：仅能访问自己的宠物

📈 统计分析 /api/statistics
• GET /health-trend/:petId     - 健康趋势图
• GET /activity/:petId         - 活动量统计
• GET /overview/:petId         - 健康概览
• GET /weight-trend/:petId     - 体重趋势
▶ 支持时间维度：day / week / month

🚀 扩展功能
• /api/upload      - 文件上传（头像）
• /api/ai          - AI健康分析
• /api/reminders   - 智能提醒
• /api/export      - 数据导出（PDF/Excel）
```

**视觉建议：**
- 使用不同颜色区分模块
- 添加HTTP方法图标（GET/POST/PUT/DELETE）

---

### 第6页：核心技术亮点 (30秒)

```
核心技术亮点 Key Features

🔒 安全设计
 ✓ JWT认证 + bcrypt密码加密
 ✓ Token自动续期（7天有效期）
 ✓ 数据权限隔离（用户级别）
 ✓ 防止SQL注入（参数化查询）

⚡ 性能优化
 ✓ 数据库索引优化（8个关键索引）
 ✓ HTTP响应压缩（Compression）
 ✓ 静态资源服务优化
 ✓ 查询结果缓存策略

🤖 智能功能
 ✓ Anthropic AI健康分析
 ✓ node-cron定时提醒系统
 ✓ 多格式数据导出（PDF/Excel）
 ✓ 实时健康数据聚合
```

**视觉建议：**
- 三列布局，每列一个主题
- 使用对勾图标强化完成感

---

### 第7页：认证与权限系统 (30秒)

```
安全认证机制 Authentication & Authorization

🔑 JWT认证流程

┌─────────┐     ┌─────────┐     ┌─────────┐
│  注册/登录 │ ──→ │ 生成Token │ ──→ │  存储本地  │
└─────────┘     └─────────┘     └─────────┘
                      ↓
          Bearer Token in Header
                      ↓
┌──────────────────────────────────────────┐
│  Middleware: authenticateToken           │
│  • 验证Token有效性                         │
│  • 解析用户信息（req.user）                │
│  • 权限检查（数据所有权）                   │
└──────────────────────────────────────────┘
                      ↓
              ┌──────┴──────┐
              │             │
         ✅ 有效        ❌ 无效
              │             │
           继续处理      403/401


🛡️ 数据隔离示例代码

// 权限检查中间件
router.put('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM pets WHERE id = ?', [id], (err, pet) => {
    if (pet.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: '无权修改此宠物信息' 
      });
    }
    // 执行更新操作...
  });
});
```

**视觉建议：**
- 流程图展示认证流程
- 代码块使用代码高亮

---

### 第8页：总结与展望 (30秒)

```
项目总结 Summary & Future

✅ 已完成功能
 • 完整的用户认证系统
 • 宠物CRUD + 文件上传
 • 健康记录与统计分析
 • AI分析 + 提醒 + 导出

📈 技术成果
 • 9个API模块，30+接口
 • 6张数据表，高性能索引
 • RESTful规范设计
 • 生产级安全机制

🚀 未来规划
 • 微服务架构拆分
 • Redis缓存层
 • 消息队列集成（RabbitMQ）
 • 移动端API适配
 • Docker容器化部署
 • CI/CD自动化流程

──────────────────────────────
感谢观看！欢迎提问
Q & A
──────────────────────────────
```

**视觉建议：**
- 左侧：已完成功能和技术成果
- 右侧：未来规划（路线图形式）
- 底部：感谢语和Q&A标识

---

## 🎤 完整演讲稿

### 开场（第1页 - 封面，10秒）

**中文：**
大家好！今天我要为大家分享的是我们团队开发的**宠物健康管理系统的后端技术架构**。这是一个功能完整的、面向宠物主人的健康管理平台，我将从技术实现的角度为大家详细介绍。

**English:**
Hello everyone! Today I will introduce the **backend architecture of our Pet Health Management System**. It is a full-featured health management platform for pet owners, and I will walk you through it from a technical implementation perspective.

---

### 第一部分（第2页 - 系统概览，30秒）

**中文：**
首先看**系统概览**。我们的后端支持**六大核心功能**：

1. 首先是**用户认证与权限管理**，确保数据安全
2. **宠物档案管理**，包括基本信息和头像上传
3. **健康记录的长期追踪**，支持多种健康指标
4. **数据可视化统计**，让健康趋势一目了然
5. **AI智能健康分析**，基于Anthropic的先进技术
6. 以及**智能提醒和多格式数据导出**功能

在技术实现上，我们采用**RESTful API设计规范**，使用**JWT进行安全认证**，实现了**完整的用户级数据隔离**，并且针对性能做了多项优化。

**English:**
Let us begin with the **system overview**. Our backend provides **six core capabilities**:

1. **User authentication and authorization** to ensure data security
2. **Pet profile management**, including basic information and avatar upload
3. **Long-term health record tracking** with multiple health metrics
4. **Data visualization and statistics** for clear health trends
5. **AI-powered health analysis** based on Anthropic technology
6. **Smart reminders and multi-format data export**

Technically, we follow **RESTful API principles**, use **JWT for secure authentication**, implement **strict user-level data isolation**, and apply multiple performance optimizations.

---

### 第二部分（第3页 - 技术栈，35秒）

**中文：**
来看我们的**技术选型**。

**核心技术方面**：
- 我们选择了**Node.js配合Express**作为Web服务框架，这个组合成熟稳定、生态丰富
- 数据库使用**轻量级的SQLite3**，这对于中小规模应用来说性能优异且部署简单
- 安全方面，我们使用**JWT实现无状态认证**，**bcrypt对密码进行加密存储**

**扩展功能上**：
- 我们集成了**Multer处理文件上传**，支持宠物头像等图片管理
- 特别值得一提的是，我们接入了**Anthropic的AI SDK**来实现宠物健康的智能分析
- 同时还支持**PDF和Excel格式的数据导出**，方便用户保存和打印
- 使用**node-cron实现定时提醒功能**，自动通知用户疫苗到期等重要事项
- 为了提升性能，我们还启用了**HTTP响应压缩**

**English:**
Now let us look at our **technology stack**.

For the **core technologies**:
- We chose **Node.js with Express** as our web framework because it is mature, stable, and has a strong ecosystem.
- We use **SQLite3** as a lightweight database, which offers excellent performance and simple deployment for small to medium-scale applications.
- For security, we use **JWT for stateless authentication** and **bcrypt for password hashing**.

For the **extended capabilities**:
- We integrated **Multer** for file uploads, such as pet avatars.
- A key highlight is our integration of the **Anthropic AI SDK** for intelligent pet health analysis.
- We also support **PDF and Excel exports** for saving and printing data.
- We use **node-cron** for scheduled reminders, such as vaccine due notifications.
- To improve performance, we enabled **HTTP response compression**.

---

### 第三部分（第4页 - 数据库设计，30秒）

**中文：**
**数据库架构方面**，我们设计了**六张核心数据表**。

- **users表**存储用户的认证信息，是整个系统的基础
- **pets表**存储宠物档案，并通过外键关联到用户，实现多对一的关系
- **health_records**是我们的核心表，记录了体重、体温、心率、血压、血糖等**9项以上的健康指标**，支持全面的健康监测

另外还有：
- **vaccinations疫苗记录表**
- **reminders智能提醒表**
- **medications用药记录表**

为了保证查询性能，我们创建了**8个关键索引**，包括用户ID、宠物ID、日期等常用查询字段的索引，大幅提升了查询速度。

**English:**
For the **database architecture**, we designed **six core tables**.

- The **users** table stores user authentication information and serves as the foundation of the system.
- The **pets** table stores pet profiles and links to users through foreign keys in a many-to-one relationship.
- The **health_records** table is our core table, storing **more than nine health metrics** such as weight, temperature, heart rate, blood pressure, and blood glucose.

In addition, we have:
- A **vaccinations** table
- A **reminders** table
- A **medications** table

To ensure query performance, we created **eight key indexes** on commonly queried fields such as user ID, pet ID, and date, which significantly improves query speed.

---

### 第四部分（第5页 - API架构，35秒）

**中文：**
**API架构方面**，我们严格遵循**RESTful设计规范**。

**认证模块**提供了用户注册、登录和获取当前用户信息三个接口：
- 注册时使用bcrypt加密密码
- 登录后返回有效期**7天的JWT Token**

**宠物管理模块**实现了完整的CRUD操作，并且每个操作都有严格的权限控制。用户**只能访问和管理自己的宠物数据**，这是通过middleware实现的数据隔离。

**统计分析模块**是一个亮点：
- 我们提供了健康趋势图、活动量统计、健康概览等功能
- 支持按**日、周、月三个时间维度**查询
- 并且对数据进行了智能聚合处理，返回更有价值的统计信息

此外还有**文件上传、AI分析、提醒管理和数据导出**等扩展API模块。

**English:**
For the **API architecture**, we strictly follow **RESTful design standards**.

The **authentication module** provides three endpoints: register, login, and get current user info.
- Passwords are encrypted with bcrypt during registration.
- Login returns a **JWT token valid for 7 days**.

The **pet management module** supports full CRUD operations with strict authorization control. Users can **only access and manage their own pet data**, achieved through middleware-based data isolation.

The **statistics module** is another highlight:
- We provide health trend charts, activity analytics, and health overviews.
- Queries support three time dimensions: **day, week, and month**.
- Data is intelligently aggregated to return more meaningful insights.

We also provide extended API modules for **file upload, AI analysis, reminder management, and data export**.

---

### 第五部分（第6页 - 技术亮点，30秒）

**中文：**
核心技术亮点有**三个方面**。

**第一是安全设计**：
- 我们使用**JWT配合bcrypt**实现了双重安全保障
- Token支持7天自动续期，平衡了安全性和用户体验
- 在所有涉及数据访问的接口都实现了**用户级别的权限隔离**
- 使用参数化查询防止SQL注入

**第二是性能优化**：
- 通过创建数据库索引、启用HTTP响应压缩
- 以及优化静态资源服务
- 系统响应速度得到了显著提升

**第三是智能功能**，这是我们的特色：
- 集成了**Anthropic AI进行健康分析**，可以根据健康记录给出专业建议
- 使用**node-cron实现定时提醒系统**，自动推送重要通知
- 支持**PDF和Excel多格式导出**，大大提升了用户体验

**English:**
There are **three major technical highlights**.

The **first is security**:
- We use **JWT together with bcrypt** for layered protection.
- Tokens support 7-day auto-renewal to balance security and user experience.
- All data-access endpoints enforce **user-level authorization isolation**.
- We use parameterized queries to prevent SQL injection.

The **second is performance optimization**:
- We created database indexes and enabled HTTP response compression.
- We also optimized static resource serving.
- These improvements significantly increased system responsiveness.

The **third is intelligent functionality**, which is our key differentiator:
- We integrated **Anthropic AI** for health analysis and recommendations.
- We use **node-cron** for scheduled reminders and automatic notifications.
- We support **multi-format export (PDF and Excel)** to improve user experience.

---

### 第六部分（第7页 - 认证系统，30秒）

**中文：**
详细说一下我们的**安全认证机制**。

用户注册或登录后，后端会生成一个**JWT Token**返回给前端存储。之后**每次API请求**，前端在Header中携带这个**Bearer Token**。

我们实现了一个**authenticateToken中间件**，它的工作流程是：
1. 首先验证Token的有效性
2. 然后解析出用户信息并注入到请求对象中
3. 最后检查用户对数据的所有权

比如在宠物编辑接口中，我们会检查**宠物的user_id是否等于当前登录用户的id**，如果不匹配就返回**403 Forbidden**错误。这样就实现了完整的数据隔离，确保用户只能操作自己的数据。

**English:**
Let me explain our **authentication and authorization mechanism** in more detail.

After user registration or login, the backend generates a **JWT token** and returns it to the frontend for storage. For **every API request**, the frontend sends this token in the header as a **Bearer Token**.

We implemented an **authenticateToken middleware** with the following flow:
1. Validate token authenticity.
2. Parse user information and attach it to the request object.
3. Check data ownership and permissions.

For example, in the pet update endpoint, we verify whether the pet's **user_id matches the current user's id**. If not, we return **403 Forbidden**. This guarantees strict data isolation so users can only operate on their own data.

---

### 结尾（第8页 - 总结，30秒）

**中文：**
最后总结一下。

**已完成的功能**包括：
- 完整的用户认证系统
- 宠物CRUD和文件上传
- 健康记录与统计分析
- 以及AI分析、提醒和导出等功能

**技术成果方面**：
- 整个后端包含**9个API模块、30多个接口**
- **6张数据表配合高性能索引**
- 完全符合**RESTful规范**
- 并实现了**生产级的安全机制**

**未来我们计划**：
- 进行微服务架构拆分，提升可扩展性
- 引入Redis缓存层，进一步提升性能
- 集成消息队列处理异步任务
- 开发移动端专用API
- 以及Docker容器化部署和CI/CD自动化流程

我的分享就到这里，**谢谢大家！现在欢迎提问。**

**English:**
To conclude:

**Completed features** include:
- A complete user authentication system
- Pet CRUD and file upload
- Health records and statistical analysis
- AI analysis, reminders, and data export

**Technical achievements** include:
- **9 API modules and more than 30 endpoints**
- **6 database tables with high-performance indexes**
- Full compliance with **RESTful standards**
- A **production-grade security mechanism**

**Our future roadmap** includes:
- Splitting into a microservices architecture for scalability
- Introducing a Redis cache layer for better performance
- Integrating message queues for asynchronous tasks
- Developing dedicated APIs for mobile clients
- Implementing Docker-based deployment and CI/CD automation

That is all for my presentation. **Thank you for listening, and I welcome your questions.**

---

## 🎯 演讲技巧提示

### 时间控制
- **总时长**：约4分钟
- **每页时间**：10秒（封面）→ 30-35秒（内容页）
- **预留**：Q&A时间另算

### 语速节奏
- 保持**中等偏慢**的语速，确保听众能跟上
- 重点技术名词（JWT、RESTful、bcrypt等）稍慢强调
- 数字和统计数据清晰念出

### 肢体语言
- 讲到核心功能时可以用**手势配合**点数（一、二、三...）
- 讲到流程图时可以**指向屏幕**说明
- 保持**眼神交流**，观察听众反应

### 重点强调
- 第3页：强调"Anthropic AI SDK"，这是亮点
- 第5页：强调"数据隔离"，这是安全特色
- 第6页：强调"三大亮点"，用递进语气
- 第7页：强调"权限检查"的代码逻辑

### 互动技巧
- 在第7页认证系统部分可以**适当停顿**，问："大家对JWT认证熟悉吗？"
- 结尾时可以说："如果大家对某个技术细节感兴趣，我可以在Q&A环节详细展开"

---

## 💡 Q&A 预备问题

### 可能被问到的问题及回答建议

**Q1: 为什么选择SQLite而不是MySQL或PostgreSQL？**
> A: SQLite非常适合中小规模应用，零配置、部署简单、性能优秀。对于我们的使用场景（单机部署、数据量在GB级别），SQLite完全够用。如果未来需要扩展，可以平滑迁移到PostgreSQL。

**Q2: JWT Token过期后怎么处理？**
> A: 当前是7天有效期，过期后需要重新登录。未来可以实现refresh token机制，在token快过期时自动续期，提升用户体验。

**Q3: 如何防止并发写入冲突？**
> A: SQLite在写入时会自动加锁，保证ACID特性。对于高并发场景，我们可以引入消息队列或者升级到支持MVCC的数据库如PostgreSQL。

**Q4: AI健康分析具体是怎么实现的？**
> A: 我们将宠物的健康记录（体重、体温、症状等）组织成结构化数据，通过Anthropic API发送给Claude模型，模型会基于兽医知识给出健康评估和建议。这是一个辅助功能，不替代专业诊断。

**Q5: 系统能支持多少并发用户？**
> A: 当前架构在单机部署下，配合索引优化和响应压缩，可以支持数百并发用户。如果需要更大规模，可以通过负载均衡、Redis缓存、数据库读写分离等方式扩展。

**Q6: 为什么不使用TypeScript？**
> A: 这是一个快速原型项目，使用JavaScript可以提高开发速度。在生产环境中，我们建议使用TypeScript来获得更好的类型安全和IDE支持。

**Q7: 安全方面还有哪些可以改进的地方？**
> A: 可以添加：
> - 请求频率限制（rate limiting）
> - HTTPS加密传输
> - CSRF防护
> - 更严格的输入验证
> - 敏感操作的二次验证

---

## 📚 附录：技术细节参考

### API接口完整列表

#### 认证模块 `/api/auth`
```
POST   /api/auth/register        用户注册
POST   /api/auth/login           用户登录
GET    /api/auth/me              获取当前用户信息 🔒
```

#### 宠物管理 `/api/pets`
```
GET    /api/pets                 获取宠物列表
GET    /api/pets/:id             获取单个宠物
POST   /api/pets                 添加宠物 🔒
PUT    /api/pets/:id             更新宠物信息 🔒
DELETE /api/pets/:id             删除宠物 🔒
```

#### 健康记录 `/api/health`
```
GET    /api/health/pet/:petId             获取宠物健康记录
POST   /api/health                        添加健康记录 🔒
GET    /api/health/vaccinations/:petId    获取疫苗记录
POST   /api/health/vaccinations           添加疫苗记录 🔒
```

#### 统计分析 `/api/statistics`
```
GET    /api/statistics/health-trend/:petId     健康趋势数据 🔒
GET    /api/statistics/activity/:petId         活动量统计 🔒
GET    /api/statistics/overview/:petId         健康概览 🔒
GET    /api/statistics/weight-trend/:petId     体重趋势 🔒
```

#### 文件上传 `/api/upload`
```
POST   /api/upload/avatar        上传宠物头像 🔒
```

#### AI分析 `/api/ai`
```
POST   /api/ai/analysis          AI健康分析 🔒
```

#### 提醒管理 `/api/reminders`
```
GET    /api/reminders            获取提醒列表 🔒
POST   /api/reminders            创建提醒 🔒
PUT    /api/reminders/:id        更新提醒 🔒
DELETE /api/reminders/:id        删除提醒 🔒
```

#### 用药记录 `/api/medications`
```
GET    /api/medications/pet/:petId    获取用药记录
POST   /api/medications               添加用药记录 🔒
PUT    /api/medications/:id           更新用药记录 🔒
DELETE /api/medications/:id           删除用药记录 🔒
```

#### 数据导出 `/api/export`
```
GET    /api/export/pdf/:petId         导出PDF报告 🔒
GET    /api/export/excel/:petId       导出Excel数据 🔒
```

🔒 = 需要JWT认证

### 数据库表结构详细说明

#### users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,              -- bcrypt加密
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### pets 表
```sql
CREATE TABLE pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                     -- 外键关联users
  name TEXT NOT NULL,
  species TEXT NOT NULL,               -- 狗、猫等
  breed TEXT,                          -- 品种
  gender TEXT,                         -- 性别
  birth_date TEXT,
  weight REAL,
  avatar TEXT,                         -- 头像URL
  owner_name TEXT,
  owner_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### health_records 表
```sql
CREATE TABLE health_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL,             -- 外键关联pets
  record_type TEXT NOT NULL,           -- 记录类型
  record_date TEXT NOT NULL,
  description TEXT,
  weight REAL,                         -- 体重
  temperature REAL,                    -- 体温
  heart_rate INTEGER,                  -- 心率
  respiratory_rate INTEGER,            -- 呼吸频率
  blood_pressure_high INTEGER,         -- 血压高压
  blood_pressure_low INTEGER,          -- 血压低压
  blood_glucose REAL,                  -- 血糖
  activity_level TEXT,                 -- 活动量
  appetite TEXT,                       -- 食欲
  mental_state TEXT,                   -- 精神状态
  symptoms TEXT,                       -- 症状
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);
```

### 性能优化索引
```sql
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX idx_health_records_date ON health_records(record_date);
CREATE INDEX idx_health_pet_date ON health_records(pet_id, record_date DESC);
CREATE INDEX idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_time, status);
CREATE INDEX idx_medications_pet_id ON medications(pet_id);
```

---

## 🎨 PPT设计建议

### 配色方案（蓝色撞色风）
- **主色调**：深蓝色 (#1E40AF) - 标题、重点
- **辅助色**：天蓝色 (#3B82F6) - 副标题、图标
- **强调色**：橙色 (#F59E0B) - 数据、高亮
- **背景色**：白色/浅灰 (#F9FAFB)

### 图标建议
- 🔐 安全相关：盾牌、锁
- ⚡ 性能相关：闪电、火箭
- 🤖 AI相关：机器人、脑图
- 📊 数据相关：图表、仪表盘
- 🐾 宠物相关：爪印、宠物剪影

### 排版建议
- **标题**：大字号（32-40pt），粗体
- **正文**：中字号（18-24pt），行间距1.5倍
- **代码**：等宽字体，浅色背景框
- **图表**：占页面50-60%，清晰可读

---

**文档生成时间**：2026-04-19  
**适用场景**：技术分享、项目答辩、工作汇报  
**建议演讲时长**：4分钟（不含Q&A）

祝演讲成功！🎉
