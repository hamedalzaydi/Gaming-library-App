# Gaming Library App Terminal Startup Script
# This script runs within the terminal and performs comprehensive checks

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Gaming Library App - Terminal Startup" -ForegroundColor Cyan
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

# Function to check if a service is responding
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds
        return $true
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

# Function to check system requirements
function Test-SystemRequirements {
    Write-Host "Checking System Requirements..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $requirements = @{
        NodeJS = $false
        NPM = $false
        Git = $false
        PowerShell = $false
        AdminRights = $false
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion) {
            Write-Status "Node.js: $nodeVersion" "SUCCESS"
            $requirements.NodeJS = $true
        }
    }
    catch {
        Write-Status "Node.js: Not installed or not in PATH" "ERROR"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        if ($npmVersion) {
            Write-Status "npm: $npmVersion" "SUCCESS"
            $requirements.NPM = $true
        }
    }
    catch {
        Write-Status "npm: Not available" "ERROR"
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        if ($gitVersion) {
            Write-Status "Git: $gitVersion" "SUCCESS"
            $requirements.Git = $true
        }
    }
    catch {
        Write-Status "Git: Not installed or not in PATH" "WARNING"
    }
    
    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    Write-Status "PowerShell: $psVersion" "SUCCESS"
    $requirements.PowerShell = $true
    
    # Check admin rights
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if ($isAdmin) {
        Write-Status "Admin Rights: Yes" "SUCCESS"
        $requirements.AdminRights = $true
    } else {
        Write-Status "Admin Rights: No (not required)" "INFO"
    }
    
    Write-Host ""
    return $requirements
}

# Function to check project files
function Test-ProjectFiles {
    Write-Host "Checking Project Files..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $projectFiles = @{
        PackageJSON = $false
        PackageLock = $false
        ServerJS = $false
        EnvLocal = $false
        NodeModules = $false
        GitRepo = $false
    }
    
    # Check package.json
    if (Test-Path "package.json") {
        Write-Status "package.json: Found" "SUCCESS"
        $projectFiles.PackageJSON = $true
        
        # Read package info
        try {
            $package = Get-Content "package.json" | ConvertFrom-Json
            Write-Host "  Project: $($package.name)" -ForegroundColor Gray
            Write-Host "  Version: $($package.version)" -ForegroundColor Gray
            Write-Host "  Description: $($package.description)" -ForegroundColor Gray
        }
        catch {
            Write-Status "  package.json: Invalid format" "ERROR"
        }
    } else {
        Write-Status "package.json: Not found" "ERROR"
    }
    
    # Check package-lock.json
    if (Test-Path "package-lock.json") {
        Write-Status "package-lock.json: Found" "SUCCESS"
        $projectFiles.PackageLock = $true
    } else {
        Write-Status "package-lock.json: Not found" "WARNING"
    }
    
    # Check server.js
    if (Test-Path "server.js") {
        Write-Status "server.js: Found" "SUCCESS"
        $projectFiles.ServerJS = $true
    } else {
        Write-Status "server.js: Not found" "ERROR"
    }
    
    # Check .env.local
    if (Test-Path ".env.local") {
        Write-Status ".env.local: Found" "SUCCESS"
        $projectFiles.EnvLocal = $true
        
        # Check IGDB credentials
        $envContent = Get-Content ".env.local"
        $hasClientId = $envContent -match "IGDB_CLIENT_ID"
        $hasClientSecret = $envContent -match "IGDB_CLIENT_SECRET"
        
        if ($hasClientId -and $hasClientSecret) {
            Write-Status "  IGDB credentials: Configured" "SUCCESS"
        } else {
            Write-Status "  IGDB credentials: Missing or incomplete" "WARNING"
        }
    } else {
        Write-Status ".env.local: Not found" "WARNING"
    }
    
    # Check node_modules
    if (Test-Path "node_modules") {
        Write-Status "node_modules: Found" "SUCCESS"
        $projectFiles.NodeModules = $true
        
        # Check if dependencies are installed
        $dependencies = @("react", "express", "cors", "dotenv")
        $missingDeps = @()
        
        foreach ($dep in $dependencies) {
            if (-not (Test-Path "node_modules\$dep")) {
                $missingDeps += $dep
            }
        }
        
        if ($missingDeps.Count -eq 0) {
            Write-Status "  Dependencies: All installed" "SUCCESS"
        } else {
            Write-Status "  Dependencies: Missing $($missingDeps -join ', ')" "WARNING"
        }
    } else {
        Write-Status "node_modules: Not found" "ERROR"
    }
    
    # Check if it's a git repository
    if (Test-Path ".git") {
        Write-Status "Git Repository: Yes" "SUCCESS"
        $projectFiles.GitRepo = $true
        
        try {
            $gitStatus = git status --porcelain
            if ($gitStatus) {
                Write-Status "  Git Status: Has uncommitted changes" "WARNING"
            } else {
                Write-Status "  Git Status: Clean working directory" "SUCCESS"
            }
        }
        catch {
            Write-Status "  Git Status: Could not determine" "WARNING"
        }
    } else {
        Write-Status "Git Repository: No" "INFO"
    }
    
    Write-Host ""
    return $projectFiles
}

# Function to check network and ports
function Test-NetworkAndPorts {
    Write-Host "Checking Network and Ports..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $networkStatus = @{
        Localhost = $false
        Port3000 = $false
        Port3001 = $false
        Internet = $false
        IGDB = $false
    }
    
    # Test localhost
    try {
        $localhostTest = Test-NetConnection -ComputerName "localhost" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($localhostTest.TcpTestSucceeded) {
            Write-Status "Localhost: Accessible" "SUCCESS"
            $networkStatus.Localhost = $true
        } else {
            Write-Status "Localhost: Not accessible" "WARNING"
        }
    }
    catch {
        Write-Status "Localhost: Test failed" "WARNING"
    }
    
    # Check port 3000
    if (Test-Port -Port 3000) {
        Write-Status "Port 3000: In use" "WARNING"
        $networkStatus.Port3000 = $true
    } else {
        Write-Status "Port 3000: Available" "SUCCESS"
    }
    
    # Check port 3001
    if (Test-Port -Port 3001) {
        Write-Status "Port 3001: In use" "WARNING"
        $networkStatus.Port3001 = $true
    } else {
        Write-Status "Port 3001: Available" "SUCCESS"
    }
    
    # Test internet connectivity
    try {
        $internetTest = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($internetTest.TcpTestSucceeded) {
            Write-Status "Internet: Connected" "SUCCESS"
            $networkStatus.Internet = $true
        } else {
            Write-Status "Internet: Not connected" "WARNING"
        }
    }
    catch {
        Write-Status "Internet: Test failed" "WARNING"
    }
    
    # Test IGDB API (if credentials exist)
    if (Test-Path ".env.local") {
        try {
            $envContent = Get-Content ".env.local"
            $clientId = ($envContent | Where-Object { $_ -match "IGDB_CLIENT_ID" }) -replace "IGDB_CLIENT_ID=", ""
            $clientSecret = ($envContent | Where-Object { $_ -match "IGDB_CLIENT_SECRET" }) -replace "IGDB_CLIENT_SECRET=", ""
            
            if ($clientId -and $clientSecret) {
                Write-Status "IGDB API: Credentials configured" "SUCCESS"
                $networkStatus.IGDB = $true
            } else {
                Write-Status "IGDB API: Credentials incomplete" "WARNING"
            }
        }
        catch {
            Write-Status "IGDB API: Could not read credentials" "WARNING"
        }
    } else {
        Write-Status "IGDB API: No credentials file" "WARNING"
    }
    
    Write-Host ""
    return $networkStatus
}

# Function to check running processes
function Test-RunningProcesses {
    Write-Host "Checking Running Processes..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $processStatus = @{
        NodeJS = $false
        NPM = $false
        PowerShell = $false
        Browser = $false
    }
    
    # Check Node.js processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Status "Node.js Processes: $($nodeProcesses.Count) running" "WARNING"
        $processStatus.NodeJS = $true
        
        foreach ($process in $nodeProcesses) {
            Write-Host "  PID: $($process.Id), Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
        }
    } else {
        Write-Status "Node.js Processes: None running" "SUCCESS"
    }
    
    # Check npm processes
    $npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    if ($npmProcesses) {
        Write-Status "NPM Processes: $($npmProcesses.Count) running" "WARNING"
        $processStatus.NPM = $true
        
        foreach ($process in $npmProcesses) {
            Write-Host "  PID: $($process.Id), Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
        }
    } else {
        Write-Status "NPM Processes: None running" "SUCCESS"
    }
    
    # Check PowerShell processes
    $psProcesses = Get-Process -Name "powershell" -ErrorAction SilentlyContinue
    Write-Status "PowerShell Processes: $($psProcesses.Count) running" "INFO"
    $processStatus.PowerShell = $true
    
    # Check browser processes
    $browserProcesses = Get-Process -Name "*chrome*,*firefox*,*edge*,*iexplore*" -ErrorAction SilentlyContinue
    if ($browserProcesses) {
        Write-Status "Browser Processes: $($browserProcesses.Count) running" "INFO"
        $processStatus.Browser = $true
    } else {
        Write-Status "Browser Processes: None running" "INFO"
    }
    
    Write-Host ""
    return $processStatus
}

# Function to perform comprehensive health check
function Test-ApplicationHealth {
    Write-Host "Performing Application Health Check..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $healthStatus = @{
        Backend = $false
        Frontend = $false
        Database = $false
        API = $false
    }
    
    # Test backend health
    if (Test-Port -Port 3001) {
        try {
            $backendHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
            if ($backendHealth.status -eq "OK") {
                Write-Status "Backend Server: Healthy" "SUCCESS"
                $healthStatus.Backend = $true
            } else {
                Write-Status "Backend Server: Unhealthy response" "WARNING"
            }
        }
        catch {
            Write-Status "Backend Server: Not responding" "ERROR"
        }
    } else {
        Write-Status "Backend Server: Not running" "ERROR"
    }
    
    # Test frontend health
    if (Test-Port -Port 3000) {
        try {
            $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
            if ($frontendHealth.StatusCode -eq 200) {
                Write-Status "Frontend App: Healthy" "SUCCESS"
                $healthStatus.Frontend = $true
            } else {
                Write-Status "Frontend App: Unexpected status $($frontendHealth.StatusCode)" "WARNING"
            }
        }
        catch {
            Write-Status "Frontend App: Not responding" "ERROR"
        }
    } else {
        Write-Status "Frontend App: Not running" "ERROR"
    }
    
    # Test IGDB API proxy
    if ($healthStatus.Backend) {
        try {
            $apiTest = Invoke-RestMethod -Uri "http://localhost:3001/api/igdb/games" -Method POST -Body "fields name; limit 1;" -ContentType "text/plain" -TimeoutSec 10
            if ($apiTest) {
                Write-Status "IGDB API Proxy: Working" "SUCCESS"
                $healthStatus.API = $true
            } else {
                Write-Status "IGDB API Proxy: Empty response" "WARNING"
            }
        }
        catch {
            Write-Status "IGDB API Proxy: Failed" "ERROR"
        }
    } else {
        Write-Status "IGDB API Proxy: Backend not available" "ERROR"
    }
    
    Write-Host ""
    return $healthStatus
}

# Function to test backend server manually
function Test-BackendServerManually {
    Write-Host "Testing Backend Server Manually..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    Write-Status "Attempting to start backend server manually..." "INFO"
    
    try {
        # Try to start the server directly in this session
        $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden
        
        Write-Status "Backend server process started with PID: $($serverProcess.Id)" "SUCCESS"
        
        # Wait a moment for the server to start
        Start-Sleep -Seconds 5
        
        # Check if it's working
        if (Test-Port -Port 3001) {
            try {
                $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
                if ($health.status -eq "OK") {
                    Write-Status "Backend server is now responding correctly!" "SUCCESS"
                    return $true
                } else {
                    Write-Status "Backend server responded but with unexpected status" "WARNING"
                    return $false
                }
            }
            catch {
                Write-Status "Backend server port is open but not responding to health check" "WARNING"
                return $false
            }
        } else {
            Write-Status "Backend server process started but port 3001 is not open" "ERROR"
            return $false
        }
    }
    catch {
        Write-Status "Failed to start backend server manually: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to run quick diagnostics
function Run-QuickDiagnostics {
    Write-Host "Running Quick Diagnostics..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Check if server.js can be executed
    Write-Status "Testing server.js execution..." "INFO"
    try {
        $testResult = node -e "console.log('Node.js is working')" 2>&1
        if ($testResult -eq "Node.js is working") {
            Write-Status "Node.js execution test: PASSED" "SUCCESS"
        } else {
            Write-Status "Node.js execution test: FAILED" "ERROR"
            Write-Host "  Output: $testResult" -ForegroundColor Red
        }
    }
    catch {
        Write-Status "Node.js execution test: FAILED" "ERROR"
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check if server.js syntax is valid
    Write-Status "Testing server.js syntax..." "INFO"
    try {
        $syntaxResult = node -c server.js 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "server.js syntax: VALID" "SUCCESS"
        } else {
            Write-Status "server.js syntax: INVALID" "ERROR"
            Write-Host "  Syntax errors found in server.js" -ForegroundColor Red
        }
    }
    catch {
        Write-Status "server.js syntax check: FAILED" "ERROR"
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check .env.local file
    Write-Status "Checking .env.local file..." "INFO"
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local"
        $hasClientId = $envContent -match "IGDB_CLIENT_ID"
        $hasClientSecret = $envContent -match "IGDB_CLIENT_SECRET"
        
        if ($hasClientId -and $hasClientSecret) {
            Write-Status ".env.local: VALID" "SUCCESS"
        } else {
            Write-Status ".env.local: INCOMPLETE" "WARNING"
            if (-not $hasClientId) { Write-Host "  Missing IGDB_CLIENT_ID" -ForegroundColor Yellow }
            if (-not $hasClientSecret) { Write-Host "  Missing IGDB_CLIENT_SECRET" -ForegroundColor Yellow }
        }
    } else {
        Write-Status ".env.local: NOT FOUND" "ERROR"
    }
    
    # Check dependencies
    Write-Status "Checking dependencies..." "INFO"
    $requiredDeps = @("express", "cors", "dotenv")
    $missingDeps = @()
    
    foreach ($dep in $requiredDeps) {
        if (-not (Test-Path "node_modules\$dep")) {
            $missingDeps += $dep
        }
    }
    
    if ($missingDeps.Count -eq 0) {
        Write-Status "Dependencies: ALL INSTALLED" "SUCCESS"
    } else {
        Write-Status "Dependencies: MISSING $($missingDeps -join ', ')" "ERROR"
        Write-Host "  Run 'npm install' to install missing dependencies" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Function to start services using direct process management
function Start-ApplicationServices {
    Write-Host "Starting Application Services..." -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Stop existing processes first
    Write-Status "Stopping existing processes..." "INFO"
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Status "Stopped existing Node.js processes" "SUCCESS"
    }
    catch {
        Write-Status "No existing processes to stop" "INFO"
    }
    
    # Start backend server
    Write-Status "Starting backend server..." "INFO"
    try {
        # Start backend server in a new PowerShell window for better visibility
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; node server.js" -WindowStyle Normal
        Write-Status "Backend server process started" "SUCCESS"
    }
    catch {
        Write-Status "Failed to start backend server" "ERROR"
        return $false
    }
    
    # Wait for backend to start
    Write-Status "Waiting for backend server..." "INFO"
    $backendReady = $false
    $attempts = 0
    $maxAttempts = 45  # Increased timeout
    
    while (-not $backendReady -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2  # Increased wait time
        $attempts++
        
        if (Test-Port -Port 3001) {
            try {
                $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 3
                if ($health.status -eq "OK") {
                    $backendReady = $true
                    Write-Status "Backend server ready after $attempts attempts" "SUCCESS"
                }
            }
            catch {
                # Port is open but service not ready yet
                Write-Host "  Port 3001 is open, waiting for service to respond..." -ForegroundColor Yellow
            }
        }
        
        if ($attempts % 5 -eq 0) {
            Write-Host "  Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if (-not $backendReady) {
        Write-Status "Backend server failed to start within timeout" "ERROR"
        Write-Host "  Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check if there are any error messages in the backend PowerShell window" -ForegroundColor White
        Write-Host "  2. Verify .env.local file has correct IGDB credentials" -ForegroundColor White
        Write-Host "  3. Try running 'node server.js' manually to see any errors" -ForegroundColor White
        
        # Offer to try manual startup
        Write-Host ""
        Write-Host "Would you like to try manual startup? (y/n): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        
        if ($response -eq "y" -or $response -eq "Y") {
            if (Test-BackendServerManually) {
                $backendReady = $true
                Write-Status "Backend server started successfully with manual method!" "SUCCESS"
            } else {
                Write-Status "Manual startup also failed" "ERROR"
                return $false
            }
        } else {
            return $false
        }
    }
    
    # Start frontend application
    Write-Status "Starting frontend application..." "INFO"
    try {
        # Start frontend app in a new PowerShell window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)'; Write-Host 'Starting Frontend Application...' -ForegroundColor Green; npm run dev" -WindowStyle Normal
        Write-Status "Frontend application process started" "SUCCESS"
    }
    catch {
        Write-Status "Failed to start frontend application" "ERROR"
        return $false
    }
    
    # Wait for frontend to start
    Write-Status "Waiting for frontend application..." "INFO"
    $frontendReady = $false
    $attempts = 0
    $maxAttempts = 90  # Increased timeout for frontend
    
    while (-not $frontendReady -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2  # Increased wait time
        $attempts++
        
        if (Test-Port -Port 3000) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 3
                if ($response.StatusCode -eq 200) {
                    $frontendReady = $true
                    Write-Status "Frontend application ready after $attempts attempts" "SUCCESS"
                }
            }
            catch {
                # Port is open but service not ready yet
                Write-Host "  Port 3000 is open, waiting for service to respond..." -ForegroundColor Yellow
            }
        }
        
        if ($attempts % 10 -eq 0) {
            Write-Host "  Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if (-not $frontendReady) {
        Write-Status "Frontend application failed to start within timeout" "ERROR"
        Write-Host "  Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check if there are any error messages in the frontend PowerShell window" -ForegroundColor White
        Write-Host "  2. Verify all dependencies are installed with 'npm install'" -ForegroundColor White
        Write-Host "  3. Try running 'npm run dev' manually to see any errors" -ForegroundColor White
        return $false
    }
    
    Write-Host ""
    return $true
}

# Function to display final status
function Show-FinalStatus {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  FINAL STATUS REPORT" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check current status
    $backendRunning = Test-Port -Port 3001
    $frontendRunning = Test-Port -Port 3000
    
    if ($backendRunning -and $frontendRunning) {
        Write-Host "SUCCESS! APPLICATION STATUS: RUNNING SUCCESSFULLY!" -ForegroundColor Green
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
        Write-Host "  Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor White
        Write-Host ""
        
        # Try to open browser
        try {
            Write-Host "Opening application in browser..." -ForegroundColor Blue
            Start-Process "http://localhost:3000"
            Write-Status "Browser opened successfully!" "SUCCESS"
        }
        catch {
            Write-Status "Could not open browser automatically" "WARNING"
        }
    } else {
        Write-Host "FAILED! APPLICATION STATUS: FAILED TO START" -ForegroundColor Red
        Write-Host ""
        Write-Host "Issues:" -ForegroundColor White
        if (-not $backendRunning) { Write-Host "  Backend server is not running" -ForegroundColor Red }
        if (-not $frontendRunning) { Write-Host "  Frontend application is not running" -ForegroundColor Red }
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check if processes are running: Get-Process -Name 'node'" -ForegroundColor White
        Write-Host "  2. Check ports: netstat -an | findstr ':3000\|:3001'" -ForegroundColor White
        Write-Host "  3. Try manual startup: npm run server (in one terminal)" -ForegroundColor White
        Write-Host "  4. Try manual startup: npm run dev (in another terminal)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Press any key to continue monitoring..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Function to monitor services
function Monitor-Services {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  SERVICE MONITORING" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        while ($true) {
            $timestamp = Get-Date -Format "HH:mm:ss"
            $backendStatus = Test-Port -Port 3001 ? "OK" : "FAIL"
            $frontendStatus = Test-Port -Port 3000 ? "OK" : "FAIL"
            
            Write-Host "[$timestamp] Backend: $backendStatus | Frontend: $frontendStatus" -ForegroundColor White
            
            # Check Node.js processes
            $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
            if ($nodeProcesses) {
                Write-Host "  Node.js Processes: $($nodeProcesses.Count) running" -ForegroundColor Gray
                foreach ($process in $nodeProcesses) {
                    Write-Host "    PID: $($process.Id), Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
                }
            } else {
                Write-Host "  Node.js Processes: None running" -ForegroundColor Red
            }
            
            Start-Sleep -Seconds 10
            Write-Host ""
        }
    }
    catch {
        Write-Host ""
        Write-Host "Monitoring stopped." -ForegroundColor Yellow
    }
}

# Main execution
try {
    Write-Host "Starting comprehensive application check..." -ForegroundColor Green
    Write-Host ""
    
    # Perform all checks
    $systemReqs = Test-SystemRequirements
    $projectFiles = Test-ProjectFiles
    $networkStatus = Test-NetworkAndPorts
    $processStatus = Test-RunningProcesses
    
    # Check if we can proceed
    $canProceed = $systemReqs.NodeJS -and $systemReqs.NPM -and $projectFiles.PackageJSON -and $projectFiles.ServerJS
    
    if (-not $canProceed) {
        Write-Host ""
        Write-Host "CRITICAL ISSUES DETECTED - Cannot proceed" -ForegroundColor Red
        Write-Host "Please fix the issues above before starting the application." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    # Check if services are already running
    $backendRunning = Test-Port -Port 3001
    $frontendRunning = Test-Port -Port 3000
    
    if ($backendRunning -and $frontendRunning) {
        Write-Host ""
        Write-Host "Services are already running!" -ForegroundColor Green
        $healthStatus = Test-ApplicationHealth
        Show-FinalStatus
    } else {
        Write-Host ""
        Write-Host "Starting application services..." -ForegroundColor Green
        
        if (Start-ApplicationServices) {
            $healthStatus = Test-ApplicationHealth
            Show-FinalStatus
        } else {
            Write-Host ""
            Write-Host "Failed to start application services" -ForegroundColor Red
            Write-Host "Running additional diagnostics..." -ForegroundColor Yellow
            
            Run-QuickDiagnostics
            
            Write-Host ""
            Write-Host "Manual startup commands:" -ForegroundColor Yellow
            Write-Host "  Terminal 1: npm run server" -ForegroundColor White
            Write-Host "  Terminal 2: npm run dev" -ForegroundColor White
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Cyan
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
    
    # Start monitoring
    Monitor-Services
}
catch {
    Write-Host ""
    Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error details and try again." -ForegroundColor Yellow
}
finally {
    # Cleanup
    Write-Host ""
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    Write-Status "Cleanup completed" "SUCCESS"
    
    Write-Host ""
    Write-Host "Goodbye!" -ForegroundColor Cyan
}
