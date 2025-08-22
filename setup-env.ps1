# GameVault Environment Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    GameVault Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host ".env.local file already exists!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current contents:" -ForegroundColor White
    Get-Content ".env.local" | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    Write-Host ""
    
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Write-Host "Overwriting .env.local..." -ForegroundColor Yellow
    } else {
        Write-Host "Setup cancelled." -ForegroundColor Red
        Read-Host "Press Enter to continue"
        exit
    }
}

Write-Host ""
Write-Host "Please enter your IGDB API credentials:" -ForegroundColor White
Write-Host ""
Write-Host "You can get these from: https://api.igdb.com/" -ForegroundColor Blue
Write-Host ""

$clientId = Read-Host "Enter your IGDB Client ID"
$clientSecret = Read-Host "Enter your IGDB Client Secret"

Write-Host ""
Write-Host "Creating .env.local file..." -ForegroundColor Green

# Create the .env.local file
@"
# IGDB API Credentials
# Get your credentials from: https://api.igdb.com/
VITE_IGDB_CLIENT_ID=$clientId
VITE_IGDB_CLIENT_SECRET=$clientSecret
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host ".env.local file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "File contents:" -ForegroundColor White
Get-Content ".env.local" | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server (Ctrl+C, then npm run dev)" -ForegroundColor White
Write-Host "2. Try searching for games again" -ForegroundColor White
Write-Host ""
Write-Host "If you need to get IGDB API credentials:" -ForegroundColor Yellow
Write-Host "- Go to https://api.igdb.com/" -ForegroundColor White
Write-Host "- Sign up for a free account" -ForegroundColor White
Write-Host "- Create a new application" -ForegroundColor White
Write-Host "- Copy the Client ID and Client Secret" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
