@echo off
echo ========================================
echo    GameVault Environment Setup
echo ========================================
echo.
echo This script will help you create the .env.local file
echo needed for the IGDB API to work properly.
echo.

REM Check if .env.local already exists
if exist ".env.local" (
    echo .env.local file already exists!
    echo.
    echo Current contents:
    type .env.local
    echo.
    echo Do you want to overwrite it? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo Overwriting .env.local...
    ) else (
        echo Setup cancelled.
        pause
        exit /b
    )
)

echo.
echo Please enter your IGDB API credentials:
echo.
echo You can get these from: https://api.igdb.com/
echo.
set /p client_id="Enter your IGDB Client ID: "
set /p client_secret="Enter your IGDB Client Secret: "

echo.
echo Creating .env.local file...

REM Create the .env.local file
(
echo VITE_IGDB_CLIENT_ID=%client_id%
echo VITE_IGDB_CLIENT_SECRET=%client_secret%
) > .env.local

echo.
echo .env.local file created successfully!
echo.
echo File contents:
type .env.local
echo.
echo Next steps:
echo 1. Restart your development server (Ctrl+C, then npm run dev)
echo 2. Try searching for games again
echo.
echo If you need to get IGDB API credentials:
echo - Go to https://api.igdb.com/
echo - Sign up for a free account
echo - Create a new application
echo - Copy the Client ID and Client Secret
echo.
pause
