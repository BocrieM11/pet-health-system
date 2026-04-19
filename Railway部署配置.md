# Railway 后端部署配置说明

## Railway 会自动检测到什么？

Railway 会自动检测你的项目并：
1. ✅ 识别为 Node.js 项目（因为有 package.json）
2. ✅ 自动运行 `npm install`
3. ✅ 自动运行 `npm start`（从 package.json 的 scripts 中读取）
4. ✅ 分配一个公网地址（如：https://pet-health-api.up.railway.app）

## 需要手动配置的内容

### 1. 环境变量（必须配置）

在 Railway 项目的 "Variables" 标签页添加：

```
JWT_SECRET=你的超级密钥-至少32位随机字符串-请务必修改
FRONTEND_URL=https://你的前端地址.vercel.app
NODE_ENV=production
```

**可选（如果使用AI功能）：**
```
ANTHROPIC_API_KEY=sk-ant-你的密钥
```

### 2. 添加 PostgreSQL 数据库

1. 在 Railway 项目中点击 "+ New"
2. 选择 "Database" → "PostgreSQL"
3. Railway 会自动创建数据库并注入环境变量：`DATABASE_URL`

### 3. 根目录设置（重要！）

如果 Railway 没有自动识别，需要手动设置：

1. 进入项目 Settings → "Root Directory"
2. 设置为：`backend`
3. Start Command 设置为：`npm start`

## 部署后要做什么？

### 1. 获取后端 URL

部署成功后，Railway 会提供一个 URL，例如：
```
https://pet-health-api-production-xxxx.up.railway.app
```

### 2. 更新前端环境变量

复制上面的 URL，然后：
1. 进入 Vercel 项目
2. Settings → Environment Variables
3. 添加或修改：
   ```
   Name: VITE_API_URL
   Value: https://你的Railway地址/api
   ```
4. 重新部署前端（Vercel 会自动重新部署）

### 3. 测试后端

```bash
# 测试后端是否正常运行
curl https://你的Railway地址/api/test

# 应该返回：
{"message":"宠物健康检测系统API正常运行！"}
```

## 常见问题

### Q: 部署后出现 "Application failed to respond"？
A: 检查以下几点：
1. package.json 中的 start 命令是否正确
2. 端口是否使用了 `process.env.PORT`（Railway 会自动注入）
3. 环境变量是否正确配置

### Q: 数据库连接失败？
A: 确保已经添加了 PostgreSQL 数据库，Railway 会自动注入 `DATABASE_URL`

### Q: 如何查看日志？
A: 在 Railway 项目中点击 "Deployments"，然后点击最新的部署查看日志

### Q: 如何重新部署？
A: 两种方式：
1. 推送代码到 GitHub（Railway 会自动重新部署）
2. 在 Railway 中点击 "Deploy" → "Redeploy"

## 数据库迁移注意事项

Railway 使用的是 PostgreSQL，而本地开发使用的是 SQLite。

代码已经做了兼容处理（通过 `DATABASE_URL` 环境变量自动切换）。

如果需要从 SQLite 迁移数据到 PostgreSQL：
1. 导出 SQLite 数据
2. 使用工具转换格式
3. 导入到 Railway 的 PostgreSQL

（通常新部署不需要迁移，直接使用新数据库）
