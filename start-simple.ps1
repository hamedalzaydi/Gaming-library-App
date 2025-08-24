# Simple Gaming Library App Startup Script
# This script starts both services in separate windows

Write-Host "Starting Gaming Library App..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "npm is not available" -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Warning: .env.local file not found. IGDB API features may not work." -ForegroundColor Yellow
    Write-Host "Please create .env.local with your IGDB credentials." -ForegroundColor Yellow
}

# Stop any existing Node.js processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped existing processes" -ForegroundColor Green
    Start-Sleep -Seconds 2
}
catch {
    Write-Host "No existing processes to stop" -ForegroundColor Blue
}

# Start backend server
Write-Host "Starting Backend Server..." -ForegroundColor Blue
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; node server.js" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Start frontend application
Write-Host "Starting Frontend Application..." -ForegroundColor Blue
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Frontend Application...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
$backendRunning = $false
$frontendRunning = $false

try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    if ($backendResponse.status -eq "OK") {
        $backendRunning = $true
        Write-Host "Backend server is running on port 3001" -ForegroundColor Green
    }
}
catch {
    Write-Host "Backend server is not responding yet" -ForegroundColor Yellow
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "Frontend application is running on port 3000" -ForegroundColor Green
    }
}
catch {
    Write-Host "Frontend application is not responding yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($backendRunning -and $frontendRunning) {
    Write-Host "SUCCESS! Both services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    
    # Open browser
    try {
        Write-Host "Opening application in browser..." -ForegroundColor Blue
        Start-Process "http://localhost:3000"
        Write-Host "Browser opened!" -ForegroundColor Green
    }
    catch {
        Write-Host "Please navigate to http://localhost:3000 manually" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Services are starting up..." -ForegroundColor Yellow
    Write-Host "Please wait a few more moments and check:" -ForegroundColor White
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "If services don't start, check the PowerShell windows for error messages." -ForegroundColor Red
}

Write-Host ""
Write-Host "Both services are running in separate PowerShell windows." -ForegroundColor Green
Write-Host "You can close this window or keep it open." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
