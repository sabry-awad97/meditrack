# Get the complete signature
$sigPath = "apps\web\src-tauri\target\release\bundle\nsis\medi-order_0.1.0_x64-setup.exe.sig"
$signature = Get-Content $sigPath -Raw
$signature = $signature.Trim()

Write-Host "Complete signature:"
Write-Host $signature
Write-Host ""
Write-Host "Length: $($signature.Length) characters"
Write-Host ""
Write-Host "Copy this signature to latest.json"
