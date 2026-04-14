# 🐾 宠物健康检测系统

一个功能完整的宠物健康管理系统，支持用户注册登录、宠物信息管理、头像上传等功能。

## ⭐ 核心功能

### 用户系统
- ✅ 用户注册/登录（JWT认证）
- ✅ 安全的密码加密存储
- ✅ 用户会话管理
- ✅ 权限控制（数据隔离）

### 宠物管理
- ✅ 宠物档案管理（新增、查看、编辑、删除）
- ✅ 宠物头像上传（支持预览、格式验证）
- ✅ 宠物信息完整记录
- ✅ 每个用户只能管理自己的宠物

### 健康追踪
- ✅ 健康记录追踪
- ✅ 疫苗接种记录
- ✅ 体重、体温监测

### 数据可视化 🆕
- ✅ 健康趋势折线图（体重、体温）
- ✅ 活动量分布柱状图
- ✅ 健康概览统计卡片
- ✅ 时间维度切换（日/周/月）
- ✅ 多宠物数据对比

### 用户体验
- ✅ 响应式设计，美观的渐变UI
- ✅ 实时表单验证
- ✅ 友好的错误提示
- ✅ 图片预览和上传进度
- ✅ 交互式数据图表

## 🛠 技术栈

**前端：**
- React 18
- React Router (路由管理)
- Axios (HTTP请求，自动Token管理)
- Recharts (数据可视化)
- Vite (快速构建工具)

**后端：**
- Node.js + Express
- SQLite3 (轻量级数据库)
- JWT (用户认证)
- Bcrypt (密码加密)
- Multer (文件上传)
- CORS (跨域支持)

## 📁 项目结构

```
pet-health-system/
├── backend/                    # 后端服务
│   ├── routes/                # API路由
│   │   ├── auth.js           # 用户认证路由
│   │   ├── pets.js           # 宠物管理路由
│   │   ├── health.js         # 健康记录路由
│   │   ├── upload.js         # 文件上传路由
│   │   └── statistics.js     # 统计分析路由
│   ├── middleware/           # 中间件
│   │   └── auth.js           # JWT认证中间件
│   ├── uploads/              # 上传文件存储目录
│   ├── database.js           # 数据库配置
│   ├── server.js             # 服务器入口
│   ├── pet_health.db         # SQLite数据库文件
│   └── package.json
├── frontend/                  # 前端应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── Login.jsx     # 登录页面
│   │   │   ├── Register.jsx  # 注册页面
│   │   │   ├── PetList.jsx   # 宠物列表
│   │   │   ├── PetDetail.jsx # 宠物详情
│   │   │   ├── AddPet.jsx    # 新增/编辑宠物
│   │   │   └── Statistics.jsx # 数据可视化页面
│   │   ├── components/       # 组件
│   │   │   ├── AvatarUpload.jsx # 头像上传组件
│   │   │   ├── HealthTrendChart.jsx # 健康趋势图
│   │   │   └── ActivityChart.jsx # 活动量图表
│   │   ├── services/         # API服务
│   │   │   └── api.js        # API封装（含拦截器）
│   │   ├── App.jsx           # 主应用组件
│   │   ├── App.css           # 样式文件
│   │   └── main.jsx          # 入口文件
│   ├── index.html
│   └── package.json
├── README.md                  # 项目文档
├── 启动指南.md                # 快速启动教程
├── 功能测试指南.md            # 功能测试文档
├── 数据可视化功能说明.md      # 数据分析功能文档
├── CHANGELOG.md               # 版本更新日志
└── 使用说明.txt               # 简要说明
```

## 🚀 快速开始

### 方法一：使用一键启动脚本（推荐）

**Windows用户：**
```bash
# 安装依赖
双击 scripts/安装依赖.bat

# 启动所有服务
双击 scripts/启动所有服务.bat
```

### 方法二：手动启动

**1. 安装依赖**

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

**2. 启动项目**

```bash
# 启动后端服务器（端口3001）- 终端1
cd backend
npm run dev

# 启动前端开发服务器（端口3000）- 终端2
cd frontend
npm run dev
```

### 3. 访问应用

在浏览器打开：**http://localhost:3000**

### 4. 开始使用

1. **注册账户：** 点击"注册"创建新账户
2. **登录系统：** 使用用户名/邮箱和密码登录
3. **添加宠物：** 点击"添加宠物"，上传头像并填写信息
4. **管理宠物：** 查看、编辑、删除您的宠物信息
5. **健康追踪：** 记录疫苗接种和健康检查
6. **设置提醒：** 创建疫苗、体检等提醒
7. **导出报告：** 导出PDF、Excel等格式的健康报告

💡 **提示：** 查看 [详细安装运行指南](docs/详细安装运行指南.md) 了解完整安装步骤

## 📊 数据库结构

### users 表（用户信息）
- id - 主键
- username - 用户名（唯一）
- email - 邮箱（唯一）
- password - 加密密码
- created_at - 创建时间

### pets 表（宠物信息）
- id - 主键
- user_id - 用户ID（外键）
- name - 宠物名字
- species - 种类（狗、猫等）
- breed - 品种
- gender - 性别
- birth_date - 出生日期
- weight - 体重
- avatar - 头像URL
- owner_name - 主人姓名
- owner_phone - 联系电话
- created_at - 创建时间

### health_records 表（健康记录）
- id - 主键
- pet_id - 宠物ID（外键）
- record_type - 记录类型
- record_date - 记录日期
- description - 描述
- weight - 体重
- temperature - 体温
- notes - 备注

### vaccinations 表（疫苗记录）
- id - 主键
- pet_id - 宠物ID（外键）
- vaccine_name - 疫苗名称
- vaccination_date - 接种日期
- next_due_date - 下次接种日期
- veterinarian - 兽医
- notes - 备注

## 🔌 API 接口

### 用户认证
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息（需要Token）

### 宠物管理（带 🔒 的需要登录）
- GET `/api/pets` - 获取宠物列表（登录后只返回自己的）
- GET `/api/pets/:id` - 获取单个宠物
- POST `/api/pets` 🔒 - 添加宠物
- PUT `/api/pets/:id` 🔒 - 更新宠物信息（仅限自己的）
- DELETE `/api/pets/:id` 🔒 - 删除宠物（仅限自己的）

### 文件上传
- POST `/api/upload/avatar` 🔒 - 上传宠物头像

### 健康记录
- GET `/api/health/pet/:petId` - 获取宠物健康记录
- POST `/api/health` - 添加健康记录
- GET `/api/health/vaccinations/:petId` - 获取疫苗记录
- POST `/api/health/vaccinations` - 添加疫苗记录

### 统计分析 🆕
- GET `/api/statistics/health-trend/:petId?period=week` 🔒 - 健康趋势数据
- GET `/api/statistics/activity/:petId?period=week` 🔒 - 活动量统计
- GET `/api/statistics/overview/:petId` 🔒 - 健康概览
- GET `/api/statistics/weight-trend/:petId?period=month` 🔒 - 体重趋势

**时间维度参数**:
- `period=day` - 今日数据
- `period=week` - 本周数据（默认）
- `period=month` - 本月数据

## 💡 下一步开发建议

1. **AI图像识别** - 集成深度学习模型进行宠物疾病诊断
2. **智能症状自查** - 问答式健康评估系统
3. ~~**数据可视化**~~ - ✅ 已完成（v2.1.0）
4. ~~**提醒功能**~~ - ✅ 已完成（v2.3.0）
5. ~~**导出功能**~~ - ✅ 已完成（v2.3.0）
6. ~~**性能优化**~~ - ✅ 已完成（v2.3.0）
7. **社交功能** - 宠物社区、经验分享
8. **移动端适配** - PWA或原生App
9. **多语言支持** - 国际化

## ❓ 常见问题

**Q: 需要先登录才能使用吗？**
A: 是的，新版本需要注册/登录后才能添加和管理宠物。这样可以保护您的数据安全。

**Q: 我的数据会被其他人看到吗？**
A: 不会。每个用户只能看到和管理自己的宠物数据，数据完全隔离。

**Q: 头像上传有什么限制？**
A: 支持 JPG、PNG、GIF 格式，文件大小不超过 5MB。

**Q: 端口被占用怎么办？**
A: 修改对应的端口配置：
- 后端：`backend/server.js` 中的 `PORT`
- 前端：`frontend/vite.config.js` 中的 `server.port`

**Q: 数据保存在哪里？**
A: 
- 数据库：`backend/pet_health.db`
- 上传的图片：`backend/uploads/`

**Q: 忘记密码怎么办？**
A: 当前版本暂不支持密码重置，请妥善保管密码。后续版本将添加此功能。

**Q: Token有效期是多久？**
A: JWT Token 有效期为 7 天，过期后需要重新登录。

## 📚 文档

- [详细安装运行指南](docs/详细安装运行指南.md) - 完整的安装和配置教程
- [新功能使用指南](docs/新功能使用指南.md) - 提醒系统、导出功能使用说明
- [快速测试新功能](docs/快速测试新功能.md) - 5分钟快速测试指南
- [更新日志 v2.3.0](docs/更新日志_v2.3.0.md) - 最新版本更新内容
- [系统优化建议](docs/系统优化建议.md) - 开发者参考文档

## 🛠 脚本工具

项目提供了便捷的启动脚本（位于 `scripts/` 目录）：

- `安装依赖.bat` - 一键安装前后端依赖
- `启动所有服务.bat` - 同时启动前后端服务
- `启动后端.bat` - 仅启动后端服务
- `启动前端.bat` - 仅启动前端服务

## 许可证

MIT
