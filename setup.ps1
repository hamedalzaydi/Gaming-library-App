# GameVault - Gaming Library App Setup Script
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GameVault - Gaming Library App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed!" -ForegroundColor Green
        Write-Host "Version: $nodeVersion" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Choose the LTS version (recommended)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host ""

# Check if npm is available
Write-Host "Checking if npm is available..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm is available!" -ForegroundColor Green
        Write-Host "Version: $npmVersion" -ForegroundColor White
    }
} catch {
    Write-Host "❌ npm is not available. Please reinstall Node.js." -ForegroundColor Red
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy env.example to .env.local" -ForegroundColor White
Write-Host "2. Add your IGDB API credentials to .env.local" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For IGDB API credentials, visit: https://api.igdb.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Green
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
