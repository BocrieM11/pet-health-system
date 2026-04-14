@echo off
chcp 65001 >nul
echo ========================================
echo 📦 安装项目依赖
echo ========================================
echo.

echo [1/2] 安装后端依赖...
cd backend
npm install
echo ✅ 后端依赖安装完成！
echo.

echo [2/2] 安装前端依赖...
cd ../frontend
npm install
echo ✅ 前端依赖安装完成！
echo.

echo ========================================
echo 🎉 所有依赖安装完成！
echo ========================================
echo.
echo 下一步：
echo 1. 双击 "启动后端.bat" 启动后端服务
echo 2. 双击 "启动前端.bat" 启动前端界面
echo 3. 浏览器打开 http://localhost:3000
echo.

pause
