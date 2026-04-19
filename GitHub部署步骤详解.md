# 🚀 GitHub + Vercel + Railway 部署完整步骤

> 30分钟从本地项目到在线网站的完整指南
> 
> 完成后你会得到：https://你的网站.vercel.app

---

## 📋 前置准备（5分钟）

### 需要注册的账号

| 服务 | 用途 | 注册链接 | 费用 |
|------|------|---------|------|
| GitHub | 代码托管 | https://github.com | 免费 |
| Vercel | 前端部署 | https://vercel.com | 免费 |
| Railway | 后端部署 | https://railway.app | 免费额度 |

**重要：** 建议都使用 GitHub 账号登录（一键授权，超方便）

---

## 第一步：上传代码到 GitHub（10分钟）

### 1.1 创建 GitHub 仓库

1. 打开 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   ```
   Repository name: pet-health-system
   Description: 宠物健康管理系统
   Public 或 Private: 随意选择
   ✅ Add a README file: 不勾选（我们已经有了）
   ```
4. 点击 "Create repository"
5. **保持页面打开**，复制仓库地址（类似：https://github.com/你的用户名/pet-health-system.git）

### 1.2 推送代码到 GitHub

**打开命令行（CMD 或 PowerShell）：**

```bash
# 1. 进入项目目录
cd C:\Users\Lenovo\Desktop\pet-health-system

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加所有文件
git add .

# 4. 创建第一次提交
git commit -m "首次提交：准备部署到云端"

# 5. 关联远程仓库（替换成你自己的仓库地址）
git remote add origin https://github.com/你的用户名/pet-health-system.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

**如果提示需要登录：**
- 会弹出浏览器登录窗口
- 或者需要输入 GitHub 用户名和密码
- **注意：** 现在 GitHub 要求使用 Personal Access Token 代替密码

**创建 Personal Access Token（如果需要）：**
1. GitHub 头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → 勾选 `repo` → Generate token
3. **复制 token（只显示一次！）**
4. 命令行推送时用 token 代替密码

### 1.3 验证上传成功

刷新 GitHub 仓库页面，应该能看到所有文件：
- ✅ backend/
- ✅ frontend/
- ✅ README.md
- ✅ .gitignore
- 等等...

---

## 第二步：部署后端到 Railway（8分钟）

### 2.1 登录 Railway

1. 打开 https://railway.app
2. 点击 "Login" → "Login with GitHub"
3. 授权 Railway 访问你的 GitHub

### 2.2 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 如果提示 "Configure GitHub App"，点击配置
4. 选择你的仓库 `pet-health-system`
5. Railway 开始分析项目...

### 2.3 配置后端服务

**Railway 可能会检测到两个服务（前端和后端），我们只需要部署后端：**

1. 删除自动创建的前端服务（如果有）
2. 只保留后端服务
3. 点击后端服务 → "Settings"
4. **重要配置：**
   ```
   Root Directory: backend
   Start Command: npm start
   ```

### 2.4 添加 PostgreSQL 数据库

1. 在项目页面点击 "+ New"
2. 选择 "Database"
3. 选择 "Add PostgreSQL"
4. Railway 会自动创建数据库
5. **重要：** Railway 会自动注入 `DATABASE_URL` 环境变量到后端服务

### 2.5 配置环境变量

点击后端服务 → "Variables" 标签页 → "+ New Variable"

**添加以下环境变量：**

```
JWT_SECRET
```
填写：`你的超级密钥-建议使用随机生成的32位以上字符串`

```
NODE_ENV
```
填写：`production`

```
FRONTEND_URL
```
填写：`https://pet-health.vercel.app`（暂时填这个，后面会改）

**可选（如果使用 AI 功能）：**
```
ANTHROPIC_API_KEY
```
填写：`sk-ant-你的密钥`

### 2.6 等待部署完成

- 点击 "Deployments" 查看部署进度
- 等待状态变为 "Success"（约2-3分钟）
- 出现绿色的 "Active" 表示部署成功

### 2.7 获取后端 URL

1. 点击后端服务
2. 进入 "Settings" 标签页
3. 找到 "Public Networking" 部分
4. 点击 "Generate Domain"
5. Railway 会生成一个域名，类似：
   ```
   https://pet-health-api-production-xxxx.up.railway.app
   ```
6. **复制这个地址！非常重要！**

### 2.8 测试后端

打开浏览器，访问：
```
https://你的Railway地址/api/test
```

应该看到：
```json
{"message":"宠物健康检测系统API正常运行！"}
```

✅ 如果看到这个，后端部署成功！

---

## 第三步：部署前端到 Vercel（8分钟）

### 3.1 登录 Vercel

1. 打开 https://vercel.com
2. 点击 "Sign Up" → "Continue with GitHub"
3. 授权 Vercel 访问你的 GitHub

### 3.2 创建新项目

1. 点击 "Add New..." → "Project"
2. 找到你的仓库 `pet-health-system`
3. 点击 "Import"

### 3.3 配置项目

**重要配置：**

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.4 添加环境变量

在 "Environment Variables" 部分：

**添加：**
```
Name: VITE_API_URL
Value: https://你的Railway地址/api
```

**注意：** 
- 把 "你的Railway地址" 替换成第二步获取的实际地址
- 末尾要加 `/api`

### 3.5 开始部署

1. 点击 "Deploy"
2. Vercel 开始构建和部署
3. 等待完成（约2-3分钟）

### 3.6 获取前端 URL

部署成功后，Vercel 会显示：
```
🎉 Congratulations!

Visit: https://pet-health-system-xxxx.vercel.app
```

**复制这个网址！**

---

## 第四步：最终配置（4分钟）

### 4.1 更新后端 CORS 配置

1. 回到 Railway
2. 进入后端服务 → "Variables"
3. 修改 `FRONTEND_URL` 环境变量
4. 改为你的 Vercel 实际地址：`https://pet-health-system-xxxx.vercel.app`
5. 点击 "Save"
6. Railway 会自动重新部署（等待约1分钟）

### 4.2 测试完整流程

打开你的前端网址：`https://pet-health-system-xxxx.vercel.app`

**测试步骤：**
1. ✅ 网站能正常打开
2. ✅ 点击"注册"，创建新账号
3. ✅ 使用账号登录
4. ✅ 点击"添加宠物"
5. ✅ 填写信息，上传头像
6. ✅ 保存成功
7. ✅ 能看到宠物列表

**如果所有步骤都成功：**
🎉 恭喜！你的系统已经成功部署到云端了！

---

## 🎊 部署完成！

### 你现在拥有：

✅ **前端网址：** https://pet-health-system-xxxx.vercel.app
- 任何人都可以访问
- 自动 HTTPS 加密
- 全球 CDN 加速

✅ **后端 API：** https://pet-health-api-xxxx.railway.app
- RESTful API 接口
- PostgreSQL 数据库
- 自动备份

✅ **自动部署：**
- 以后每次 `git push`
- Vercel 和 Railway 都会自动重新部署
- 无需手动操作

---

## 🔧 后续操作

### 绑定自定义域名（可选）

**Vercel 绑定域名：**
1. 购买域名（阿里云/腾讯云/Namecheap）
2. Vercel 项目 → Settings → Domains
3. 添加你的域名
4. 按提示配置 DNS 记录

**Railway 绑定域名：**
1. Railway 项目 → Settings → Networking
2. 添加自定义域名
3. 配置 CNAME 记录

### 更新代码

```bash
# 1. 修改代码
# 2. 提交到 Git
git add .
git commit -m "更新功能"
git push

# 3. Vercel 和 Railway 会自动部署
# 4. 约2-3分钟后生效
```

### 查看日志

**Railway 后端日志：**
- 进入项目 → Deployments → 点击最新部署 → View Logs

**Vercel 前端日志：**
- 进入项目 → Deployments → 点击最新部署 → Function Logs

---

## ❓ 遇到问题？

### 前端打开是空白页面
**原因：** API 地址配置错误

**解决：**
1. F12 打开浏览器控制台
2. 查看错误信息
3. 检查 Vercel 环境变量 `VITE_API_URL` 是否正确
4. 修改后重新部署

### 后端 API 调用失败
**原因：** CORS 配置错误

**解决：**
1. 检查 Railway 环境变量 `FRONTEND_URL` 是否正确
2. 必须是完整的 Vercel 网址
3. 不要包含尾部斜杠 `/`

### 数据库连接失败
**原因：** 没有添加 PostgreSQL 数据库

**解决：**
1. Railway 项目中点击 "+ New"
2. 选择 Database → PostgreSQL
3. 等待数据库创建完成
4. 重新部署后端服务

### 图片上传失败
**原因：** Railway 的文件系统是临时的

**解决：**
- 短期：可以继续使用，但重启后图片会丢失
- 长期：迁移到对象存储（阿里云 OSS / 腾讯云 COS）

---

## 🎉 总结

你已经成功将项目部署到云端了！

**花费时间：** 约 30 分钟  
**总成本：** 完全免费  
**效果：** 获得一个全球可访问的在线网站

**现在你可以：**
- 把网址分享给朋友
- 用于毕业设计演示
- 展示在简历/作品集上
- 继续开发新功能

**需要帮助？**
- 查看文档：https://vercel.com/docs
- Railway 文档：https://docs.railway.app
- 或者直接问我！😊
