# Gaming Library App - Final Optimized Startup Script
# This script provides reliable startup with better timing and error handling

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Gaming Library App - Final Startup Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

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

# Function to display status with colors
function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    
    switch ($Status) {
        "SUCCESS" { Write-Host "[OK] $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[INFO] $Message" -ForegroundColor Blue }
        default { Write-Host "  $Message" -ForegroundColor White }
    }
}

# Function to run comprehensive checks
function Run-SystemChecks {
    Write-Host "Running System Checks..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Status "Node.js: $nodeVersion" "SUCCESS"
    }
    catch {
        Write-Status "Node.js: Not installed or not in PATH" "ERROR"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Status "npm: $npmVersion" "SUCCESS"
    }
    catch {
        Write-Status "npm: Not available" "ERROR"
        return $false
    }
    
    # Check project files
    if (-not (Test-Path "package.json")) {
        Write-Status "package.json: Not found" "ERROR"
        return $false
    }
    Write-Status "package.json: Found" "SUCCESS"
    
    if (-not (Test-Path "server.js")) {
        Write-Status "server.js: Not found" "ERROR"
        return $false
    }
    Write-Status "server.js: Found" "SUCCESS"
    
    if (-not (Test-Path ".env.local")) {
        Write-Status ".env.local: Not found (IGDB features may not work)" "WARNING"
    } else {
        Write-Status ".env.local: Found" "SUCCESS"
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Status "node_modules: Not found (run 'npm install' first)" "ERROR"
        return $false
    }
    Write-Status "node_modules: Found" "SUCCESS"
    
    Write-Host ""
    return $true
}

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Stop any existing Node.js processes
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Status "Stopped existing processes" "SUCCESS"
    }
    catch {
        Write-Status "No existing processes to stop" "INFO"
    }
    
    # Start backend server
    Write-Status "Starting backend server..." "INFO"
    try {
        # Start in a new PowerShell window for better visibility
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; node server.js" -WindowStyle Normal
        Write-Status "Backend server process started" "SUCCESS"
    }
    catch {
        Write-Status "Failed to start backend server" "ERROR"
        return $false
    }
    
    # Wait for backend to start with longer timeout
    Write-Status "Waiting for backend server to start..." "INFO"
    $backendReady = $false
    $attempts = 0
    $maxAttempts = 60  # 2 minutes total
    
    while (-not $backendReady -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempts++
        
        if (Test-Port -Port 3001) {
            try {
                $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
                if ($health.status -eq "OK") {
                    $backendReady = $true
                    Write-Status "Backend server ready after $attempts attempts" "SUCCESS"
                }
            }
            catch {
                Write-Host "  Port 3001 is open, waiting for service to respond..." -ForegroundColor Yellow
            }
        }
        
        if ($attempts % 10 -eq 0) {
            Write-Host "  Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if (-not $backendReady) {
        Write-Status "Backend server failed to start within timeout" "ERROR"
        Write-Host "  Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check the backend PowerShell window for error messages" -ForegroundColor White
        Write-Host "  2. Verify .env.local has correct IGDB credentials" -ForegroundColor White
        Write-Host "  3. Try running 'node server.js' manually" -ForegroundColor White
        return $false
    }
    
    return $true
}

# Function to start frontend application
function Start-FrontendApp {
    Write-Host "Starting Frontend Application..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    Write-Status "Starting frontend application..." "INFO"
    try {
        # Start in a new PowerShell window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Frontend Application...' -ForegroundColor Green; npm run dev" -WindowStyle Normal
        Write-Status "Frontend application process started" "SUCCESS"
    }
    catch {
        Write-Status "Failed to start frontend application" "ERROR"
        return $false
    }
    
    # Wait for frontend to start
    Write-Status "Waiting for frontend application to start..." "INFO"
    $frontendReady = $false
    $attempts = 0
    $maxAttempts = 120  # 4 minutes total for frontend
    
    while (-not $frontendReady -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempts++
        
        if (Test-Port -Port 3000) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    $frontendReady = $true
                    Write-Status "Frontend application ready after $attempts attempts" "SUCCESS"
                }
            }
            catch {
                Write-Host "  Port 3000 is open, waiting for service to respond..." -ForegroundColor Yellow
            }
        }
        
        if ($attempts % 15 -eq 0) {
            Write-Host "  Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if (-not $frontendReady) {
        Write-Status "Frontend application failed to start within timeout" "ERROR"
        Write-Host "  Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check the frontend PowerShell window for error messages" -ForegroundColor White
        Write-Host "  2. Verify all dependencies are installed with 'npm install'" -ForegroundColor White
        Write-Host "  3. Try running 'npm run dev' manually" -ForegroundColor White
        return $false
    }
    
    return $true
}

# Function to test application health
function Test-ApplicationHealth {
    Write-Host "Testing Application Health..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $allHealthy = $true
    
    # Test backend
    if (Test-Port -Port 3001) {
        try {
            $backendHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
            if ($backendHealth.status -eq "OK") {
                Write-Status "Backend Server: Healthy" "SUCCESS"
            } else {
                Write-Status "Backend Server: Unhealthy response" "WARNING"
                $allHealthy = $false
            }
        }
        catch {
            Write-Status "Backend Server: Not responding" "ERROR"
            $allHealthy = $false
        }
    } else {
        Write-Status "Backend Server: Not running" "ERROR"
        $allHealthy = $false
    }
    
    # Test frontend
    if (Test-Port -Port 3000) {
        try {
            $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
            if ($frontendHealth.StatusCode -eq 200) {
                Write-Status "Frontend App: Healthy" "SUCCESS"
            } else {
                Write-Status "Frontend App: Unexpected status $($frontendHealth.StatusCode)" "WARNING"
                $allHealthy = $false
            }
        }
        catch {
            Write-Status "Frontend App: Not responding" "ERROR"
            $allHealthy = $false
        }
    } else {
        Write-Status "Frontend App: Not running" "ERROR"
        $allHealthy = $false
    }
    
    Write-Host ""
    return $allHealthy
}

# Function to show success message
function Show-SuccessMessage {
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "  SUCCESS! APPLICATION IS RUNNING!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor White
    Write-Host "  Backend Server:  http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  Frontend App:    http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open your browser to http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Test the search functionality" -ForegroundColor White
    Write-Host "  3. Add games to your library" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop the application:" -ForegroundColor Yellow
    Write-Host "  Close the PowerShell windows or use: Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor White
    Write-Host ""
    
    # Try to open browser
    try {
        Write-Host "Opening application in browser..." -ForegroundColor Blue
        Start-Process "http://localhost:3000"
        Write-Status "Browser opened successfully!" "SUCCESS"
    }
    catch {
        Write-Status "Could not open browser automatically" "WARNING"
        Write-Host "  Please navigate to http://localhost:3000 manually" -ForegroundColor Yellow
    }
}

# Function to show manual startup instructions
function Show-ManualStartupInstructions {
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host "  MANUAL STARTUP REQUIRED" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The automated startup encountered issues. Please start manually:" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
    Write-Host "  npm run server" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Then open http://localhost:3000 in your browser" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main execution
try {
    Write-Host "Starting Gaming Library App..." -ForegroundColor Green
    Write-Host ""
    
    # Run system checks
    if (-not (Run-SystemChecks)) {
        Write-Host ""
        Write-Host "System checks failed. Please fix the issues above." -ForegroundColor Red
        Show-ManualStartupInstructions
        exit 1
    }
    
    # Check if services are already running
    $backendRunning = Test-Port -Port 3001
    $frontendRunning = Test-Port -Port 3000
    
    if ($backendRunning -and $frontendRunning) {
        Write-Host ""
        Write-Host "Services are already running!" -ForegroundColor Green
        Test-ApplicationHealth
        Show-SuccessMessage
    } else {
        Write-Host ""
        Write-Host "Starting application services..." -ForegroundColor Green
        
        # Start backend
        if (Start-BackendServer) {
            # Start frontend
            if (Start-FrontendApp) {
                # Test health
                if (Test-ApplicationHealth) {
                    Show-SuccessMessage
                } else {
                    Write-Host ""
                    Write-Host "Application started but health checks failed." -ForegroundColor Yellow
                    Show-ManualStartupInstructions
                }
            } else {
                Write-Host ""
                Write-Host "Frontend failed to start." -ForegroundColor Red
                Show-ManualStartupInstructions
            }
        } else {
            Write-Host ""
            Write-Host "Backend failed to start." -ForegroundColor Red
            Show-ManualStartupInstructions
        }
    }
}
catch {
    Write-Host ""
    Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    Show-ManualStartupInstructions
}
finally {
    Write-Host ""
    Write-Host "Script completed." -ForegroundColor Cyan
}
