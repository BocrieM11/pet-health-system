@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 启动宠物健康检测系统 - 后端服务
echo ========================================
echo.

cd backend

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

echo 🚀 启动后端服务器（端口3001）...
echo 提示：按 Ctrl+C 可停止服务
echo.
npm run dev

pause
