# PowerShell script to set TAURI_SIGNING_PRIVATE_KEY environment variable
# This script reads the private key from the file and sets it as a user environment variable

$keyPath = "$env:USERPROFILE\.tauri\medi-order.key"

if (-not (Test-Path $keyPath)) {
    Write-Host "Error: Private key file not found at $keyPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please generate the signing keys first:" -ForegroundColor Yellow
    Write-Host "  bunx tauri signer generate -w $keyPath" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Reading private key from: $keyPath" -ForegroundColor Green

try {
    $privateKey = Get-Content $keyPath -Raw
    $privateKey = $privateKey.Trim()
    
    # Check if key is encrypted (contains "encrypted secret key")
    $isEncrypted = $privateKey -match "encrypted secret key"
    
    # Set the private key environment variable
    [System.Environment]::SetEnvironmentVariable('TAURI_SIGNING_PRIVATE_KEY', $privateKey, 'User')
    
    Write-Host ""
    Write-Host "✓ Successfully set TAURI_SIGNING_PRIVATE_KEY environment variable" -ForegroundColor Green
    
    # If encrypted, prompt for password
    if ($isEncrypted) {
        Write-Host ""
        Write-Host "Your key is password-protected." -ForegroundColor Yellow
        Write-Host "Please enter the password you used when generating the key:" -ForegroundColor Yellow
        $password = Read-Host -AsSecureString
        $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        # Set the password environment variable
        [System.Environment]::SetEnvironmentVariable('TAURI_SIGNING_PRIVATE_KEY_PASSWORD', $passwordPlain, 'User')
        
        Write-Host ""
        Write-Host "✓ Successfully set TAURI_SIGNING_PRIVATE_KEY_PASSWORD environment variable" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "IMPORTANT: You must restart your terminal for the changes to take effect!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To verify, open a new terminal and run:" -ForegroundColor Cyan
    Write-Host "  echo `$env:TAURI_SIGNING_PRIVATE_KEY" -ForegroundColor Cyan
    if ($isEncrypted) {
        Write-Host "  echo `$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD" -ForegroundColor Cyan
    }
    Write-Host ""
}
catch {
    Write-Host "Error: Failed to set environment variable" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
