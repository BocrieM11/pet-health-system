@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 启动宠物健康检测系统
echo ========================================
echo.
echo 正在启动服务，请保持此窗口打开...
echo.

cd /d "%~dp0"

echo [1/2] 启动后端服务（端口3001）...
start "宠物系统-后端" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务（端口3000）...
start "宠物系统-前端" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✅ 服务启动完成！
echo ========================================
echo.
echo 🌐 前端地址: http://localhost:3000
echo 📡 后端地址: http://localhost:3001
echo.
echo 提示：
echo - 两个新窗口已打开（后端和前端）
echo - 请勿关闭这两个窗口
echo - 5秒后将自动打开浏览器
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo 现在可以关闭此窗口了
pause
