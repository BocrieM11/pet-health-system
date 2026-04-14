@echo off
chcp 65001 >nul
echo ========================================
echo 🎨 启动宠物健康检测系统 - 前端界面
echo ========================================
echo.

cd frontend

echo 📦 检查依赖...
if not exist "node_modules\" (
    echo ⚠️  未检测到依赖，开始安装...
    echo.
    npm install
    echo.
    echo ✅ 依赖安装完成！
    echo.
) else (
    echo ✅ 依赖已安装
    echo.
)

echo 🎨 启动前端开发服务器（端口3000）...
echo 提示：按 Ctrl+C 可停止服务
echo.
echo 🌐 启动后将自动打开浏览器 http://localhost:3000
echo.
npm run dev

pause
