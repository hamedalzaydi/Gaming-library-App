# Gaming Library App Startup Script - Improved Version
# This script starts both the backend server and frontend application

Write-Host "Starting Gaming Library App..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Function to wait for a service to be available
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$Port,
        [int]$TimeoutSeconds = 60
    )
    
    Write-Host "Waiting for $ServiceName to start on port $Port..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    $timeout = $startTime.AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $timeout) {
        if (Test-Port -Port $Port) {
            Write-Host "$ServiceName is now running on port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Timeout waiting for $ServiceName to start" -ForegroundColor Red
    return $false
}

# Function to kill existing Node.js processes
function Stop-NodeProcesses {
    Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            $nodeProcesses | Stop-Process -Force
            Write-Host "Stopped existing Node.js processes" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } else {
            Write-Host "No existing Node.js processes found" -ForegroundColor Blue
        }
    }
    catch {
        Write-Host "Warning: Could not stop existing processes" -ForegroundColor Yellow
    }
}

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server (Port 3001)..." -ForegroundColor Blue
    
    try {
        # Start backend server in a new PowerShell window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; node server.js" -WindowStyle Normal
        
        # Wait for server to start
        if (Wait-ForService -ServiceName "Backend Server" -Port 3001 -TimeoutSeconds 30) {
            return $true
        } else {
            return $false
        }
    }
    catch {
        Write-Host "Failed to start backend server: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to start frontend application
function Start-FrontendApp {
    Write-Host "Starting Frontend Application (Port 3000)..." -ForegroundColor Blue
    
    try {
        # Start frontend app in a new PowerShell window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; npm run dev" -WindowStyle Normal
        
        # Wait for frontend to start
        if (Wait-ForService -ServiceName "Frontend App" -Port 3000 -TimeoutSeconds 60) {
            return $true
        } else {
            return $false
        }
    }
    catch {
        Write-Host "Failed to start frontend application: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test API endpoints
function Test-APIEndpoints {
    Write-Host "Testing API endpoints..." -ForegroundColor Yellow
    
    try {
        # Test backend health endpoint
        $backendResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
        if ($backendResponse.status -eq "OK") {
            Write-Host "Backend API is responding correctly" -ForegroundColor Green
        } else {
            Write-Host "Backend API returned unexpected response" -ForegroundColor Red
            return $false
        }
        
        # Test frontend
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Host "Frontend application is responding correctly" -ForegroundColor Green
        } else {
            Write-Host "Frontend returned unexpected status: $($frontendResponse.StatusCode)" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "API test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to display success message
function Show-SuccessMessage {
    Write-Host ""
    Write-Host "SUCCESS! Gaming Library App is now running!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend Application:" -ForegroundColor White
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Status: Running" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend Server:" -ForegroundColor White
    Write-Host "   URL: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "   Status: Running" -ForegroundColor Green
    Write-Host ""
    Write-Host "To open the application:" -ForegroundColor Yellow
    Write-Host "   1. Open your web browser" -ForegroundColor White
    Write-Host "   2. Navigate to: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   3. Or click the link above if your terminal supports it" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop the application:" -ForegroundColor Yellow
    Write-Host "   Close the PowerShell windows that were opened" -ForegroundColor White
    Write-Host ""
    Write-Host "Process Information:" -ForegroundColor Yellow
    Write-Host "   Backend: Running in separate PowerShell window" -ForegroundColor White
    Write-Host "   Frontend: Running in separate PowerShell window" -ForegroundColor White
    Write-Host ""
    
    # Try to open the application in default browser
    try {
        Write-Host "Opening application in your default browser..." -ForegroundColor Blue
        Start-Process "http://localhost:3000"
        Write-Host "Browser opened successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Could not automatically open browser. Please navigate to http://localhost:3000 manually." -ForegroundColor Yellow
    }
}

# Function to display error message
function Show-ErrorMessage {
    Write-Host ""
    Write-Host "FAILED! Gaming Library App could not start properly." -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Check if ports 3000 and 3001 are available" -ForegroundColor White
    Write-Host "   2. Ensure Node.js is installed and in PATH" -ForegroundColor White
    Write-Host "   3. Check if .env.local file exists with IGDB credentials" -ForegroundColor White
    Write-Host "   4. Try running 'npm install' to ensure dependencies are installed" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual startup commands:" -ForegroundColor Yellow
    Write-Host "   Terminal 1: npm run server" -ForegroundColor White
    Write-Host "   Terminal 2: npm run dev" -ForegroundColor White
    Write-Host ""
}

# Main execution
try {
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
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
        Write-Host "   Please create .env.local with your IGDB credentials." -ForegroundColor Yellow
    }
    
    # Stop existing processes
    Stop-NodeProcesses
    
    # Start backend server
    if (-not (Start-BackendServer)) {
        Show-ErrorMessage
        exit 1
    }
    
    # Start frontend application
    if (-not (Start-FrontendApp)) {
        Show-ErrorMessage
        exit 1
    }
    
    # Test API endpoints
    if (-not (Test-APIEndpoints)) {
        Show-ErrorMessage
        exit 1
    }
    
    # Show success message
    Show-SuccessMessage
    
    Write-Host ""
    Write-Host "Both services are now running in separate PowerShell windows." -ForegroundColor Green
    Write-Host "You can close this window or keep it open to monitor the services." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
catch {
    Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorMessage
    exit 1
}
