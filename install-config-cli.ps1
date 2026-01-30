# MediTrack Configuration CLI Installer
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MediTrack Configuration CLI Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building meditrack-config CLI..." -ForegroundColor Yellow
Write-Host ""

# Build the CLI tool
cargo build --manifest-path apps/web/src-tauri/crates/config/Cargo.toml --bin meditrack-config --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build successful!" -ForegroundColor Green
Write-Host ""

# Get the binary path
$binaryPath = "apps\web\src-tauri\target\release\meditrack-config.exe"

if (-not (Test-Path $binaryPath)) {
    Write-Host "Binary not found at: $binaryPath" -ForegroundColor Red
    exit 1
}

Write-Host "Binary location: $binaryPath" -ForegroundColor Cyan
Write-Host ""

# Ask user what to do
Write-Host "Choose installation option:" -ForegroundColor Yellow
Write-Host "  1. Copy to user bin directory" -ForegroundColor White
Write-Host "  2. Add to PATH (current session)" -ForegroundColor White
Write-Host "  3. Show manual instructions" -ForegroundColor White
Write-Host "  4. Run it now" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        $cargobin = "$env:USERPROFILE\.cargo\bin"
        if (-not (Test-Path $cargobin)) {
            New-Item -ItemType Directory -Path $cargobin -Force | Out-Null
        }
        
        Copy-Item $binaryPath "$cargobin\meditrack-config.exe" -Force
        Write-Host ""
        Write-Host "Installed to: $cargobin\meditrack-config.exe" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run: meditrack-config" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Note: Make sure $cargobin is in your PATH" -ForegroundColor Yellow
    }
    
    "2" {
        $currentPath = (Get-Location).Path + "\apps\web\src-tauri\target\release"
        $env:PATH = "$currentPath;$env:PATH"
        Write-Host ""
        Write-Host "Added to PATH (current session only)" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run: meditrack-config" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Note: This is temporary for this session only" -ForegroundColor Yellow
    }
    
    "3" {
        Write-Host ""
        Write-Host "Manual Installation Instructions:" -ForegroundColor Cyan
        Write-Host "=================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option A: Copy to a directory in your PATH" -ForegroundColor Yellow
        Write-Host "  Copy-Item '$binaryPath' 'C:\Windows\System32\meditrack-config.exe'" -ForegroundColor White
        Write-Host ""
        Write-Host "Option B: Add to user bin directory" -ForegroundColor Yellow
        Write-Host "  Copy-Item '$binaryPath' '$env:USERPROFILE\.cargo\bin\meditrack-config.exe'" -ForegroundColor White
        Write-Host ""
        Write-Host "Option C: Run from current location" -ForegroundColor Yellow
        Write-Host "  .\$binaryPath" -ForegroundColor White
        Write-Host ""
    }
    
    "4" {
        Write-Host ""
        Write-Host "Launching meditrack-config..." -ForegroundColor Green
        Write-Host ""
        & $binaryPath
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "For more info: apps\web\src-tauri\crates\config\CLI_README.md" -ForegroundColor Cyan
Write-Host ""
