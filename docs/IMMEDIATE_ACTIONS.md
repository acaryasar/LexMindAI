# Immediate Actions - Security Fixes

## Overview

This document outlines the immediate actions required to complete Phase 1 security fixes.

## Completed Actions ✅

- [x] Email password removed from .env.development
- [x] .env.development added to .gitignore
- [x] JWT secrets updated with placeholders
- [x] Database credentials separated into environment variables
- [x] Redis password added
- [x] POSTGRES_HOST_AUTH_METHOD removed
- [x] Docker default credentials moved to environment variables
- [x] Swagger disabled in production
- [x] Random token generation fixed (crypto.randomBytes)
- [x] Demo endpoint password disclosure fixed
- [x] Demo endpoint disabled in production
- [x] secrets.txt added to .gitignore

## Remaining Actions

### 1. Generate Strong Secrets

#### Option A: Using PowerShell (Windows)
```powershell
cd scripts
.\generate-secrets.ps1
```

#### Option B: Using Bash (Linux/Mac/WSL)
```bash
cd scripts
chmod +x generate-secrets.sh
./generate-secrets.sh
```

#### Option C: Manual Generation
```bash
# Generate each secret manually
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 32  # DATABASE_PASSWORD
openssl rand -base64 32  # REDIS_PASSWORD
openssl rand -base64 16  # MINIO_ROOT_USER
openssl rand -base64 32  # MINIO_ROOT_PASSWORD
openssl rand -base64 32  # S3_ACCESS_KEY
openssl rand -base64 32  # S3_SECRET_KEY
openssl rand -base64 32  # ENCRYPTION_KEY
```

### 2. Update .env.development

Copy the generated secrets to `apps/backend/.env.development`:

```bash
# Replace these placeholders with generated secrets:
JWT_SECRET=your-jwt-secret-generate-with-openssl-rand-base64-32
JWT_REFRESH_SECRET=your-refresh-secret-generate-with-openssl-rand-base64-32
DATABASE_PASSWORD=your-strong-password-here
REDIS_PASSWORD=your-redis-password-here
MINIO_ROOT_PASSWORD=your-strong-password-here
S3_SECRET_KEY=your-strong-password-here
```

### 3. Create .env File for Docker

Create `.env` file in root directory for Docker Compose:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generated-database-password>
POSTGRES_DB=lexmind_ai

# Redis
REDIS_PASSWORD=<generated-redis-password>

# JWT
JWT_SECRET=<generated-jwt-secret>
JWT_REFRESH_SECRET=<generated-jwt-refresh-secret>

# MinIO
MINIO_ROOT_USER=<generated-minio-user>
MINIO_ROOT_PASSWORD=<generated-minio-password>

# S3
S3_ACCESS_KEY=<generated-s3-access-key>
S3_SECRET_KEY=<generated-s3-secret-key>
```

### 4. Restart Docker Containers

```bash
# Stop existing containers
docker-compose down

# Start containers with new configuration
docker-compose up -d

# Verify containers are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### 5. Clean Git History (Optional but Recommended)

**WARNING:** This will rewrite git history. Only do this if you're comfortable with git history rewriting.

#### Option A: Using BFG Repo-Cleaner (Recommended)
```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clean sensitive data from history
java -jar bfg.jar --delete-files .env.development

# Clean large files
java -jar bfg.jar --strip-blobs-bigger-than 100M

# Clean up refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

#### Option B: Using git filter-branch (Manual)
```bash
# Remove .env.development from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch apps/backend/.env.development" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### 6. Verify Changes

#### Verify .env.development
```bash
# Check file exists and is not empty
cat apps/backend/.env.development

# Verify it's in .gitignore
grep ".env.development" .gitignore
```

#### Verify Docker Configuration
```bash
# Verify docker-compose.yml uses environment variables
grep "\${" docker-compose.yml

# Verify containers start successfully
docker-compose up -d
docker-compose ps
```

#### Verify Application
```bash
# Start application
cd apps/backend
npm run start:dev

# Verify Swagger is disabled in production
# Set NODE_ENV=production and check /api/docs is not accessible
```

## Post-Implementation Checklist

- [ ] Strong secrets generated
- [ ] .env.development updated with strong secrets
- [ ] .env file created for Docker Compose
- [ ] Docker containers restarted successfully
- [ ] Application starts without errors
- [ ] Swagger disabled in production
- [ ] Git history cleaned (optional)
- [ ] secrets.txt deleted or securely stored
- [ ] Team notified of changes
- [ ] Documentation updated

## Rollback Plan

If something goes wrong:

### Rollback .env.development
```bash
git checkout HEAD -- apps/backend/.env.development
```

### Rollback docker-compose.yml
```bash
git checkout HEAD -- docker-compose.yml
```

### Rollback .gitignore
```bash
git checkout HEAD -- .gitignore
```

### Rollback Code Changes
```bash
git checkout HEAD -- apps/backend/src/main.ts
git checkout HEAD -- apps/backend/src/modules/auth/services/auth.service.ts
```

## Support

If you encounter issues:

1. Check Docker logs: `docker-compose logs`
2. Check application logs: `npm run start:dev`
3. Verify environment variables are set correctly
4. Check file permissions
5. Review error messages carefully

## Next Steps

After completing these immediate actions:

1. Begin Phase 2: Short-term fixes (1 week)
2. Review Security Roadmap: `docs/SECURITY_ROADMAP.md`
3. Schedule team training: `docs/TEAM_TRAINING_SCHEDULE.md`
4. Plan penetration testing: `docs/PENETRATION_TESTING_PLAN.md`

---

*Last Updated: July 26, 2026*
