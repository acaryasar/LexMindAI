#!/bin/bash

# LexMind AI - Generate Strong Secrets
# This script generates cryptographically secure secrets for environment variables

echo "Generating strong secrets for LexMind AI..."
echo ""

# Function to generate secret
generate_secret() {
    local name=$1
    local secret=$(openssl rand -base64 32)
    echo "$name=$secret"
}

# Generate secrets
echo "# Generated Secrets - $(date)" > secrets.txt
echo "" >> secrets.txt
echo "# JWT Secrets" >> secrets.txt
generate_secret "JWT_SECRET" >> secrets.txt
generate_secret "JWT_REFRESH_SECRET" >> secrets.txt
echo "" >> secrets.txt
echo "# Database Password" >> secrets.txt
generate_secret "DATABASE_PASSWORD" >> secrets.txt
echo "" >> secrets.txt
echo "# Redis Password" >> secrets.txt
generate_secret "REDIS_PASSWORD" >> secrets.txt
echo "" >> secrets.txt
echo "# MinIO Credentials" >> secrets.txt
generate_secret "MINIO_ROOT_USER" >> secrets.txt
generate_secret "MINIO_ROOT_PASSWORD" >> secrets.txt
echo "" >> secrets.txt
echo "# S3 Credentials" >> secrets.txt
generate_secret "S3_ACCESS_KEY" >> secrets.txt
generate_secret "S3_SECRET_KEY" >> secrets.txt
echo "" >> secrets.txt
echo "# Encryption Key" >> secrets.txt
generate_secret "ENCRYPTION_KEY" >> secrets.txt

echo "Secrets generated and saved to secrets.txt"
echo ""
echo "IMPORTANT:"
echo "1. Copy these secrets to your .env.development file"
echo "2. Do NOT commit secrets.txt to git"
echo "3. Add secrets.txt to .gitignore"
echo "4. Store secrets securely (password manager, secret manager)"
echo ""
cat secrets.txt
