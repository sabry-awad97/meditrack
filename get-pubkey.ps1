# Get the complete public key
$pubKeyPath = "C:\Users\Work Pc\.tauri\medi-order-new.key.pub"
$pubKey = Get-Content $pubKeyPath -Raw
$pubKey = $pubKey.Trim()

Write-Host "Complete public key:"
Write-Host $pubKey
Write-Host ""
Write-Host "Length: $($pubKey.Length) characters"
