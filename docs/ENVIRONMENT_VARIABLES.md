# Environment Variables Documentation

This document describes all environment variables required for the LexMind AI application.

## Required Environment Variables

### Database
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/lexmind
```
- **Description**: PostgreSQL connection string
- **Required**: Yes
- **Example**: `postgresql://lexmind:strong_password@localhost:5432/lexmind`
- **Security**: Must be kept secret, use strong password

### Redis
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```
- **Description**: Redis configuration for caching and rate limiting
- **Required**: Yes (Redis must be running)
- **Security**: Redis password should be strong in production

### JWT Secrets
```bash
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```
- **Description**: JWT token configuration
- **Required**: Yes
- **Security**: Secrets must be at least 32 characters, randomly generated
- **Generation**: Use `scripts/generate-secrets.ps1` (Windows) or `scripts/generate-secrets.sh` (Linux/Mac)

### Encryption
```bash
ENCRYPTION_KEY=your_encryption_key_min_32_chars
```
- **Description**: Encryption key for sensitive data (API keys, etc.)
- **Required**: Yes
- **Security**: Must be at least 32 characters, randomly generated

### SMTP (Email)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=noreply@lexmind.ai
```
- **Description**: SMTP configuration for email notifications
- **Required**: Yes (for email features)
- **Security**: Use app-specific passwords, not regular passwords

### Sentry (Error Tracking)
```bash
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```
- **Description**: Sentry DSN for error tracking
- **Required**: Optional (recommended for production)
- **Security**: Keep secret

## Optional Environment Variables

### Application
```bash
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
```
- **Description**: Application configuration
- **Default Values**: `NODE_ENV=development`, `PORT=3001`, `API_PREFIX=api/v1`

### Rate Limiting
```bash
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```
- **Description**: Rate limiting configuration
- **Default Values**: `THROTTLE_TTL=60`, `THROTTLE_LIMIT=100`
- **Recommendation**: Adjust based on traffic patterns

### Logging
```bash
LOG_LEVEL=info
```
- **Description**: Winston logger level
- **Options**: `error`, `warn`, `info`, `debug`, `verbose`
- **Default**: `info`
- **Recommendation**: Use `warn` or `error` in production

### CORS
```bash
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```
- **Description**: Allowed CORS origins
- **Default**: Hardcoded in main.ts
- **Recommendation**: Configure via environment variable for flexibility

## Security Best Practices

### 1. Never Commit Secrets
- Add `.env.*` files to `.gitignore`
- Use `.env.example` as template only
- Never commit actual secrets to version control

### 2. Use Strong Secrets
- Minimum 32 characters for all secrets
- Use cryptographically secure random generation
- Rotate secrets regularly (every 90 days)

### 3. Environment-Specific Configuration
- Use separate files for each environment:
  - `.env.development`
  - `.env.staging`
  - `.env.production`

### 4. Secret Management in Production
- Use secret management services:
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Docker Secrets (for containers)

### 5. Access Control
- Restrict access to environment files
- Use file permissions: `chmod 600 .env.production`
- Only authorized personnel should have access

## Secret Generation

### Windows (PowerShell)
```powershell
cd scripts
.\generate-secrets.ps1
```

### Linux/Mac (Bash)
```bash
cd scripts
chmod +x generate-secrets.sh
./generate-secrets.sh
```

This will generate a `secrets.txt` file with strong secrets for all required variables.

## Environment File Template

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lexmind

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Encryption
ENCRYPTION_KEY=your_encryption_key_min_32_chars

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=noreply@lexmind.ai

# Sentry (Optional)
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info
```

## Troubleshooting

### Redis Connection Failed
- Check if Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT
- Check firewall settings

### Database Connection Failed
- Verify DATABASE_URL format
- Check if PostgreSQL is running
- Verify database credentials

### JWT Token Invalid
- Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
- Secrets must match between application restarts
- Check token expiration settings

### Email Not Sending
- Verify SMTP credentials
- Check SMTP port (587 for TLS, 465 for SSL)
- Ensure app-specific password is used (not regular password)

## Compliance

### GDPR
- All secrets must be encrypted at rest
- Access logs must be maintained
- Secrets must be rotated regularly

### SOC 2
- Secret management must be documented
- Access controls must be implemented
- Regular audits of secret access

## References

- [OWASP Secret Management](https://owasp.org/www-community/Secrets_Management_Cheat_Sheet)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
