# Deployment Security Guide

This guide provides comprehensive security instructions for deploying the LexMind AI application to production.

## Pre-Deployment Preparation

### 1. Environment Setup

#### Generate Strong Secrets
```bash
# Windows
cd scripts
.\generate-secrets.ps1

# Linux/Mac
cd scripts
chmod +x generate-secrets.sh
./generate-secrets.sh
```

Copy the generated secrets to your `.env.production` file.

#### Configure Environment Variables
Create `.env.production` with the following:
```bash
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:strong_password@localhost:5432/lexmind

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password

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

# Sentry
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=warn
```

#### Secure Environment File
```bash
chmod 600 .env.production
```

### 2. Database Security

#### PostgreSQL Configuration
```sql
-- Create dedicated user with limited permissions
CREATE USER lexmind WITH PASSWORD 'strong_password';
CREATE DATABASE lexmind OWNER lexmind;
GRANT ALL PRIVILEGES ON DATABASE lexmind TO lexmind;

-- Connect to database and grant schema permissions
\c lexmind
GRANT ALL ON SCHEMA public TO lexmind;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lexmind;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lexmind;
```

#### Enable SSL/TLS
Add to `postgresql.conf`:
```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

Update connection string:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/lexmind?sslmode=require
```

#### Database Backup
```bash
# Automated daily backup
0 2 * * * pg_dump -U lexmind lexmind > /backups/lexmind_$(date +\%Y\%m\%d).sql

# Encrypted backup
0 2 * * * pg_dump -U lexmind lexmind | gzip | gpg --encrypt --recipient backup@lexmind.ai > /backups/lexmind_$(date +\%Y\%m\%d).sql.gz.gpg
```

### 3. Redis Security

#### Configure Authentication
Edit `redis.conf`:
```
requirepass strong_redis_password
bind 127.0.0.1
protected-mode yes
```

#### Enable TLS (Optional)
```
tls-port 6380
port 0
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt
```

#### Redis Backup
```bash
# Automated daily backup
0 3 * * * redis-cli --rdb /backups/dump_$(date +\%Y\%m\%d).rdb
```

## Deployment Methods

### Docker Deployment

#### Dockerfile Security
```dockerfile
# Use non-root user
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./apps/backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=lexmind
      - POSTGRES_USER=lexmind
      - POSTGRES_PASSWORD=strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass strong_redis_password
    volumes:
      - redis_data:/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true

volumes:
  postgres_data:
  redis_data:
```

#### Docker Secrets (Swarm)
```yaml
version: '3.8'
services:
  backend:
    secrets:
      - database_url
      - jwt_access_secret
      - jwt_refresh_secret
      - encryption_key
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - JWT_ACCESS_SECRET_FILE=/run/secrets/jwt_access_secret
      - JWT_REFRESH_SECRET_FILE=/run/secrets/jwt_refresh_secret
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key

secrets:
  database_url:
    external: true
  jwt_access_secret:
    external: true
  jwt_refresh_secret:
    external: true
  encryption_key:
    external: true
```

### Kubernetes Deployment

#### Secret Management
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: lexmind-secrets
type: Opaque
stringData:
  database-url: "postgresql://user:password@postgres:5432/lexmind"
  jwt-access-secret: "your_jwt_access_secret"
  jwt-refresh-secret: "your_jwt_refresh_secret"
  encryption-key: "your_encryption_key"
```

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexmind-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lexmind-backend
  template:
    metadata:
      labels:
        app: lexmind-backend
    spec:
      containers:
      - name: backend
        image: lexmind/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: lexmind-secrets
              key: database-url
        - name: JWT_ACCESS_SECRET
          valueFrom:
            secretKeyRef:
              name: lexmind-secrets
              key: jwt-access-secret
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Cloud Deployment (AWS)

#### EC2 Security
```bash
# Security Group Rules
- Inbound:
  - SSH (22): Your IP only
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
- Outbound:
  - All traffic: 0.0.0.0/0

# Instance Hardening
sudo apt update
sudo apt upgrade -y
sudo apt install -y fail2ban ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### RDS Configuration
- Enable encryption at rest
- Enable encryption in transit
- Use VPC with private subnets
- Configure security groups
- Enable automated backups
- Enable Multi-AZ deployment

#### ElastiCache Configuration
- Enable encryption at rest
- Enable encryption in transit
- Use VPC with private subnets
- Configure security groups
- Enable automatic failover

## Post-Deployment Security

### 1. SSL/TLS Configuration

#### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.lexmind.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.lexmind.ai;

    ssl_certificate /etc/letsencrypt/live/api.lexmind.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.lexmind.ai/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Let's Encrypt Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.lexmind.ai
sudo certbot renew --dry-run
```

### 2. Firewall Configuration

#### UFW (Ubuntu)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### iptables
```bash
# Flush existing rules
sudo iptables -F
sudo iptables -X

# Default policies
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (from your IP only)
sudo iptables -A INPUT -p tcp -s YOUR_IP --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Save rules
sudo iptables-save > /etc/iptables/rules.v4
```

### 3. Monitoring Setup

#### Health Check Endpoint
```bash
# Monitor application health
curl https://api.lexmind.ai/api/v1/health

# Monitor metrics
curl https://api.lexmind.ai/api/v1/health/metrics

# Monitor system status
curl https://api.lexmind.ai/api/v1/health/status
```

#### Log Monitoring
```bash
# View application logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# View error logs
tail -f logs/error-$(date +%Y-%m-%d).log

# View security logs
tail -f logs/security-$(date +%Y-%m-%d).log
```

#### Sentry Integration
Ensure `SENTRY_DSN` is set in `.env.production` to enable error tracking.

## Security Hardening

### 1. System Hardening

#### Disable Root SSH Login
```bash
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

#### Use SSH Keys Only
```bash
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

#### Install Fail2Ban
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Application Hardening

#### Disable Swagger in Production
```typescript
// main.ts
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('LexMind AI API')
    .setDescription('Enterprise Development Kit for Law Firms')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

#### Enable Request Logging
```typescript
// main.ts
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.url}`, 'HTTP');
  next();
});
```

### 3. Network Hardening

#### Configure DDoS Protection
- Use Cloudflare or similar service
- Configure rate limiting at CDN level
- Enable bot protection

#### Enable WAF
- Configure Web Application Firewall
- Block common attack patterns
- Enable SQL injection protection
- Enable XSS protection

## Backup & Recovery

### Database Backup Strategy
```bash
# Daily full backup
0 2 * * * pg_dump -U lexmind lexmind | gzip > /backups/daily/lexmind_$(date +\%Y\%m\%d).sql.gz

# Weekly full backup
0 3 * * 0 pg_dump -U lexmind lexmind | gzip > /backups/weekly/lexmind_$(date +\%Y\%m\%d).sql.gz

# Monthly full backup
0 4 1 * * pg_dump -U lexmind lexmind | gzip > /backups/monthly/lexmind_$(date +\%Y\%m\%d).sql.gz

# Retention policy
find /backups/daily -name "*.sql.gz" -mtime +7 -delete
find /backups/weekly -name "*.sql.gz" -mtime +30 -delete
find /backups/monthly -name "*.sql.gz" -mtime +365 -delete
```

### Disaster Recovery Plan
1. **Identify RTO/RPO**: Define acceptable downtime and data loss
2. **Backup Verification**: Regularly test backup restoration
3. **Failover Procedure**: Document and test failover process
4. **Communication Plan**: Define notification procedures
5. **Recovery Testing**: Conduct regular disaster recovery drills

## Compliance

### GDPR
- Data encryption at rest and in transit
- Data retention policy implementation
- User data export/deletion endpoints
- Privacy policy compliance
- Data breach notification procedure

### SOC 2
- Access control implementation
- Change management process
- Incident response procedure
- Security monitoring
- Regular audits

### HIPAA (if applicable)
- PHI encryption
- Access logging
- Business associate agreements
- Risk assessment
- Contingency planning

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Check environment variables
cat .env.production

# Check database connection
psql -U lexmind -d lexmind -c "SELECT 1"

# Check Redis connection
redis-cli -a strong_redis_password ping
```

#### High Memory Usage
```bash
# Check memory usage
free -h

# Check process memory
ps aux --sort=-%mem | head

# Restart application
pm2 restart lexmind
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql -U lexmind -d lexmind -c "SELECT version()"
```

## References

- [OWASP Deployment Guide](https://owasp.org/www-community/Deployment_Guide)
- [NIST Security Guidelines](https://www.nist.gov/cyberframework)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
