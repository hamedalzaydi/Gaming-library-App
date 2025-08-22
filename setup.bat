@echo off
echo ========================================
echo GameVault - Gaming Library App Setup
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version (recommended).
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo Node.js is installed!
echo Version: 
node --version
echo.

echo Checking if npm is available...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not available. Please reinstall Node.js.
    pause
    exit /b 1
)

echo npm is available!
echo Version:
npm --version
echo.

echo Installing project dependencies...
npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy env.example to .env.local
echo 2. Add your IGDB API credentials to .env.local
echo 3. Run: npm run dev
echo.
echo For IGDB API credentials, visit: https://api.igdb.com/
echo.
pause
