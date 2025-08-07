@echo off
echo Starting CORS Proxy Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    echo This proxy server requires Node.js to run.
    pause
    exit /b 1
)

echo ✅ Node.js found!
echo 🚀 Starting CORS proxy server on port 8001...
echo.
echo 📝 Instructions:
echo 1. Leave this window open while using the Task Creator
echo 2. In the Task Creator form, check "Use CORS Proxy"
echo 3. Select "Custom Proxy URL" and enter: http://localhost:8001/?url=
echo 4. Press Ctrl+C here to stop the proxy when done
echo.

node cors-proxy.js

pause
