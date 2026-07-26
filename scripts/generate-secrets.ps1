# LexMind AI - Generate Strong Secrets (PowerShell)
# This script generates cryptographically secure secrets for environment variables

Write-Host "Generating strong secrets for LexMind AI..."
Write-Host ""

# Function to generate secret
function Generate-Secret {
    param([string]$Name)
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
    Write-Output "$Name=$secret"
}

# Generate secrets
$secretsFile = "secrets.txt"
"# Generated Secrets - $(Get-Date)" | Out-File -FilePath $secretsFile
"" | Out-File -FilePath $secretsFile -Append
"# JWT Secrets" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "JWT_SECRET" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "JWT_REFRESH_SECRET" | Out-File -FilePath $secretsFile -Append
"" | Out-File -FilePath $secretsFile -Append
"# Database Password" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "DATABASE_PASSWORD" | Out-File -FilePath $secretsFile -Append
"" | Out-File -FilePath $secretsFile -Append
"# Redis Password" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "REDIS_PASSWORD" | Out-File -FilePath $secretsFile -Append
"" | Out-File -FilePath $secretsFile -Append
"# MinIO Credentials" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "MINIO_ROOT_USER" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "MINIO_ROOT_PASSWORD" | Out-File -FilePath $secretsFile -Append
"" | Out-File -FilePath $secretsFile -Append
"# S3 Credentials" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "S3_ACCESS_KEY" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "S3_SECRET_KEY" | Out-File -FilePath $secretsFile -Append
"" | Out-File -FilePath $secretsFile -Append
"# Encryption Key" | Out-File -FilePath $secretsFile -Append
Generate-Secret -Name "ENCRYPTION_KEY" | Out-File -FilePath $secretsFile -Append

Write-Host "Secrets generated and saved to secrets.txt"
Write-Host ""
Write-Host "IMPORTANT:"
Write-Host "1. Copy these secrets to your .env.development file"
Write-Host "2. Do NOT commit secrets.txt to git"
Write-Host "3. Add secrets.txt to .gitignore"
Write-Host "4. Store secrets securely (password manager, secret manager)"
Write-Host ""
Get-Content $secretsFile
