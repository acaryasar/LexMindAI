# Dependency Fix Guide

Bu rehber LexMind AI projesindeki dependency vulnerability'lerini nasıl düzelteceğinizi açıklar.

## Mevcut Durum

```bash
npm audit
```

**Sonuç:**
- 65 vulnerabilities (3 low, 19 moderate, 42 high, 1 critical)
- Kullanıcı automatic fix'i breaking changes nedeniyle iptal etti

## Yaklaşım Stratejisi

### 1. Critical Vulnerability (Öncelik: Yüksek)
- Hemen düzeltilmeli
- Manual review gerekebilir
- Breaking change riski yüksek

### 2. High Vulnerabilities (Öncelik: Yüksek)
- Mümkün olan en kısa sürede düzeltilmeli
- Manual review gerekebilir
- Breaking change riski orta

### 3. Moderate Vulnerabilities (Öncelik: Orta)
- Planlı bakım sırasında düzeltilmeli
- Manual review önerilir
- Breaking change riski düşük

### 4. Low Vulnerabilities (Öncelik: Düşük)
- Sonraki major release'te düzeltilmeli
- Otomatik fix yeterli olabilir

## Adım Adım Fix Planı

### Adım 1: Detaylı Audit Raporu

```bash
# Detaylı audit raporu al
npm audit --json > audit-report.json

# Raporu incele
cat audit-report.json | jq '.vulnerabilities'
```

Bu rapor şunları gösterecek:
- Hangi paketler vulnerability içeriyor
- Severity seviyeleri
- Hangi versiyonlara upgrade edilmeli
- CVE detayları

### Adım 2: Critical Vulnerability Analizi

```bash
# Critical vulnerability'leri listele
npm audit --audit-level=critical
```

**Örnek Çıktı:**
```
critical  <package-name>  <current-version>  <vulnerable-versions>
```

**Analiz:**
1. Paketin ne işe yaradığını anlayın
2. Hangi kodda kullanıldığını bulun
3. Breaking change riskini değerlendirin
4. Test planı oluşturun

### Adım 3: Manual Fix Stratejisi

#### Strateji A: Otomatik Fix (Low Risk)
```bash
# Otomatik fix dene
npm audit fix

# Force fix (breaking changes kabul et)
npm audit fix --force
```

**Kullanım Durumu:**
- Low severity vulnerabilities
- Test kapsamı yüksek olan paketler
- Breaking change riski düşük olanlar

#### Strateji B: Manual Upgrade (Medium Risk)
```bash
# Spesifik paketi upgrade et
npm install <package>@<safe-version>

# Örnek:
npm install lodash@4.17.21
npm install axios@1.6.0
```

**Kullanım Durumu:**
- High severity vulnerabilities
- Breaking change riski orta olanlar
- API değişiklikleri olan paketler

#### Strateji C: Patching (High Risk)
```bash
# npm-patch kullanarak vulnerability'leri patch et
npm install -g npm-patch
npm-patch <package-name>
```

**Kullanım Durumu:**
- Critical vulnerabilities
- Upgrade mümkün olmayan paketler
- Acil fix gerektiren durumlar

#### Strateji D: Alternative Paket (Son Çare)
```bash
# Alternative paket bul ve migrate et
npm uninstall <vulnerable-package>
npm install <alternative-package>
```

**Kullanım Durumu:**
- Bakımda kaldırılmış paketler
- Fix edilemeyen vulnerabilities
- Daha iyi alternatifler mevcut

### Adım 4: Test Planı

#### Pre-Fix Test
```bash
# Mevcut testleri çalıştır
npm test

# Build test
npm run build

# Lint test
npm run lint
```

#### Post-Fix Test
```bash
# Testleri tekrar çalıştır
npm test

# Build test
npm run build

# Lint test
npm run lint

# E2E test (varsa)
npm run test:e2e

# Manual test
npm run dev
# Uygulamayı manuel test et
```

### Adım 5: Rollback Planı

```bash
# Fix öncesi state'i kaydet
git commit -am "Pre-fix state"

# Fix'i uygula
npm audit fix

# Test et
npm test

# Eğer başarısız olursa:
git reset --hard HEAD
npm install
```

## Örnek Fix Senaryoları

### Senaryo 1: Lodash Vulnerability

**Problem:**
```
high  lodash  4.17.15  Prototype Pollution
```

**Çözüm:**
```bash
# Lodash'ı güvenli versiyona upgrade et
npm install lodash@4.17.21

# Test et
npm test

# Eğer breaking varsa:
# 1. Kullanım yerlerini bul
grep -r "lodash" src/

# 2. Breaking changes'i kontrol et
# https://github.com/lodash/lodash/wiki/Changelog

# 3. Kodu güncelle
# Örnek: _.flattenDeep -> _.flatten
```

### Senaryo 2: Axios Vulnerability

**Problem:**
```
high  axios  0.24.0  SSRF Vulnerability
```

**Çözüm:**
```bash
# Axios'ı güvenli versiyona upgrade et
npm install axios@1.6.0

# Test et
npm test

# Eğer API değişiklikleri varsa:
# 1. Axios kullanım yerlerini güncelle
# 2. Error handling'i güncelle
# 3. Response interceptor'ları güncelle
```

### Senaryo 3: Express Vulnerability

**Problem:**
```
critical  express  4.17.1  DoS Vulnerability
```

**Çözüm:**
```bash
# Express'i güvenli versiyona upgrade et
npm install express@4.18.2

# Test et
npm test

# Eğer breaking varsa:
# 1. Middleware'leri kontrol et
# 2. Route handler'ları güncelle
# 3. Error handling'i güncelle
```

## Otomatik Dependency Update

### Weekly Dependency Update Script

```bash
#!/bin/bash
# scripts/update-dependencies.sh

echo "Starting dependency update..."

# Audit çalıştır
npm audit

# Low risk vulnerabilities'ları fix et
npm audit fix

# Test çalıştır
npm test

# Eğer test başarısız olursa
if [ $? -ne 0 ]; then
    echo "Tests failed, reverting..."
    git checkout package.json package-lock.json
    npm install
    exit 1
fi

# Commit
git add package.json package-lock.json
git commit -m "chore: update dependencies (weekly)"

echo "Dependency update completed successfully"
```

### GitHub Actions CI/CD Integration

```yaml
# .github/workflows/dependency-check.yml

name: Dependency Check

on:
  schedule:
    - cron: '0 0 * * 0' # Her Pazar gece yarısı
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run audit
        run: npm audit
        
      - name: Run audit fix (dry-run)
        run: npm audit fix --dry-run
        
      - name: Run tests
        run: npm test
        
      - name: Create issue if vulnerabilities found
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Security vulnerabilities detected',
              body: 'npm audit found vulnerabilities. Please review and fix.',
              labels: ['security', 'dependencies']
            })
```

## Dependency Security Best Practices

### 1. Regular Updates
- Weekly low-risk updates
- Monthly medium-risk updates
- Quarterly high-risk updates

### 2. Automated Testing
- Her update sonrası test çalıştır
- E2E testleri entegre et
- Manual test planı hazırla

### 3. Monitoring
- Dependabot kullan (GitHub)
- Snyk kullan
- Renovate bot kullan

### 4. Lockfile Management
- `package-lock.json` commit et
- `yarn.lock` kullanıyorsan onu commit et
- Her developer aynı lockfile'ı kullanmalı

### 5. Peer Dependencies
- Peer dependency conflicts'i izle
- Major version upgrade'lerde dikkatli ol
- SemVer'i anlayın

## Önerilen Fix Sırası

### Hafta 1: Critical Vulnerabilities
```bash
# Critical audit
npm audit --audit-level=critical

# Manual fix
npm install <critical-package>@<safe-version>

# Test
npm test
npm run build
```

### Hafta 2: High Vulnerabilities
```bash
# High audit
npm audit --audit-level=high

# Manual fix
npm install <high-package>@<safe-version>

# Test
npm test
npm run build
```

### Hafta 3-4: Moderate Vulnerabilities
```bash
# Moderate audit
npm audit --audit-level=moderate

# Otomatik fix
npm audit fix

# Test
npm test
npm run build
```

### Hafta 5+: Low Vulnerabilities
```bash
# Otomatik fix
npm audit fix

# Test
npm test
```

## Risk Mitigation

### 1. Feature Flags
```typescript
// Breaking change olan paketler için feature flag
const useNewFeature = process.env.USE_NEW_FEATURE === 'true';

if (useNewFeature) {
  // Yeni API kullan
} else {
  // Eski API kullan
}
```

### 2. Adapter Pattern
```typescript
// Breaking change'i adapter ile yönet
interface LegacyApi {
  oldMethod(): void;
}

interface NewApi {
  newMethod(): void;
}

class ApiAdapter implements LegacyApi {
  constructor(private newApi: NewApi) {}
  
  oldMethod() {
    this.newApi.newMethod();
  }
}
```

### 3. Version Pinning
```json
{
  "dependencies": {
    "package": "1.2.3" // Tam versiyon pin
  }
}
```

## Monitoring & Alerting

### 1. Dependabot (GitHub)
```yaml
# .github/dependabot.yml

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
```

### 2. Snyk
```bash
# Snyk CLI kur
npm install -g snyk

# Authenticate
snyk auth

# Test
snyk test

# Monitor
snyk monitor
```

### 3. Renovate Bot
```yaml
# renovate.json

{
  "extends": [
    "config:base"
  ],
  "schedule": ["every weekend"],
  "labels": ["dependencies"],
  "automerge": false,
  "major": {
    "automerge": false
  }
}
```

## Maliyet Tahmini

- **Geliştirme Süresi**: 16-24 saat (tüm vulnerabilities)
- **Test Süresi**: 8-12 saat
- **Bakım Süresi**: 2-4 saat/ay
- **Maliyet**: Yok (open source araçlar)

## Özet

1. **Critical**: Hemen manual fix
2. **High**: Planlı manual fix
3. **Moderate**: Otomatik fix + test
4. **Low**: Otomatik fix
5. **Monitoring**: Dependabot/Snyk entegrasyonu
6. **CI/CD**: Automated dependency check

Bu plan ile güvenlik skoru 8.5/10'dan 8.9/10'a çıkabilir.
