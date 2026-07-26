# MFA (Multi-Factor Authentication) Implementation Guide

Bu rehber LexMind AI için MFA implementasyonunu adım adım açıklar.

## MFA Seçenekleri

### 1. TOTP (Time-based One-Time Password) - Önerilen
- **Avantajları**: Ücretsiz, offline çalışır, standart (RFC 6238)
- **Kullanım**: Google Authenticator, Authy, Microsoft Authenticator
- **Zorluk**: Orta
- **Maliyet**: Yok

### 2. SMS-based MFA
- **Avantajları**: Kullanıcı dostu, ek uygulama gerekmez
- **Dezavantajları**: SMS maliyeti, SIM swap riski
- **Zorluk**: Düşük
- **Maliyet**: SMS gönderim ücreti

### 3. Email-based OTP
- **Avantajları**: Ücretsiz, mevcut altyapı kullanılabilir
- **Dezavantajları**: Email güvenliğine bağımlı
- **Zorluk**: Düşük
- **Maliyet**: Yok

## Önerilen Implementasyon: TOTP

### Adım 1: Prisma Schema Güncelleme

```prisma
// prisma/schema.prisma

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  firstName       String?
  lastName        String?
  phoneNumber     String?
  password        String
  roles           String[]  @default(["USER"])
  mfaEnabled      Boolean   @default(false)
  mfaSecret       String?   // TOTP secret (encrypted)
  backupCodes     String[]  // Backup codes (encrypted)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  createdBy       String?
  updatedBy       String?
  deletedBy       String?

  // Relations
  cases           Case[]
  clients         Client[]
  // ... other relations
}
```

### Adım 2: TOTP Library Kurulumu

```bash
npm install otplib speakeasy
npm install @types/speakeasy --save-dev
```

### Adım 3: MFA Service Oluşturma

```typescript
// apps/backend/src/modules/auth/services/mfa.service.ts

import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { EncryptionUtil } from '@common/encryption.util';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class MfaService {
  constructor(
    private prisma: PrismaService,
    private encryptionUtil: EncryptionUtil,
  ) {}

  // TOTP secret oluştur
  generateSecret(email: string) {
    return speakeasy.generateSecret({
      name: 'LexMind AI',
      issuer: 'LexMind AI',
      length: 32,
      secret: speakeasy.generateSecret({ length: 32 }).base32,
    });
  }

  // QR code URL oluştur
  generateQrCodeUrl(secret: string, email: string) {
    return speakeasy.otpauth.URL({
      secret: secret,
      label: email,
      issuer: 'LexMind AI',
      encoding: 'base32',
    });
  }

  // TOTP token doğrula
  verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // 2 time step tolerance
    });
  }

  // Backup codes oluştur
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(speakeasy.generateSecret({ length: 8 }).base32);
    }
    return codes;
  }

  // MFA'ı etkinleştir
  async enableMfa(userId: string, secret: string, token: string) {
    // Token'ı doğrula
    const isValid = this.verifyToken(token, secret);
    if (!isValid) {
      throw new Error('Invalid TOTP token');
    }

    // Secret'ı encrypt et ve kaydet
    const encryptedSecret = this.encryptionUtil.encrypt(secret, process.env.ENCRYPTION_KEY);
    
    // Backup codes oluştur ve encrypt et
    const backupCodes = this.generateBackupCodes();
    const encryptedBackupCodes = backupCodes.map(code => 
      this.encryptionUtil.encrypt(code, process.env.ENCRYPTION_KEY)
    );

    // User'ı güncelle
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
      },
    });

    return { backupCodes }; // Backup codes kullanıcıya gösterilmeli (bir kere)
  }

  // MFA'ı devre dışı bırak
  async disableMfa(userId: string, password: string) {
    // Password doğrula (AuthService kullanarak)
    // ...
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: [],
      },
    });
  }

  // Backup code kullan
  async useBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user || !user.backupCodes) {
      return false;
    }

    // Decrypt backup codes ve kontrol et
    const decryptedCodes = user.backupCodes.map(encryptedCode =>
      this.encryptionUtil.decrypt(encryptedCode, process.env.ENCRYPTION_KEY)
    );

    const codeIndex = decryptedCodes.indexOf(code);
    if (codeIndex === -1) {
      return false;
    }

    // Kullanılan code'u kaldır
    const updatedBackupCodes = user.backupCodes.filter((_, i) => i !== codeIndex);
    await this.prisma.user.update({
      where: { id: userId },
      data: { backupCodes: updatedBackupCodes },
    });

    return true;
  }

  // MFA gerekiyor mu kontrol et
  async isMfaRequired(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });

    return user?.mfaEnabled || false;
  }
}
```

### Adım 4: MFA DTO'ları Oluşturma

```typescript
// apps/backend/src/modules/auth/dto/enable-mfa.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class EnableMfaDto {
  @ApiProperty({ description: 'TOTP secret' })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({ description: 'TOTP token from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  token: string;
}

// apps/backend/src/modules/auth/dto/verify-mfa.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyMfaDto {
  @ApiProperty({ description: 'TOTP token or backup code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  code: string;
}

// apps/backend/src/modules/auth/dto/disable-mfa.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DisableMfaDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Adım 5: MFA Controller Endpoints

```typescript
// apps/backend/src/modules/auth/controllers/mfa.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MfaService } from '../services/mfa.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { EnableMfaDto, VerifyMfaDto, DisableMfaDto } from '../dto';

@ApiTags('MFA')
@Controller('mfa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Setup MFA - get secret and QR code' })
  @ApiResponse({ status: 200, description: 'MFA setup data returned' })
  async setupMfa(@Request() req: any) {
    const secret = this.mfaService.generateSecret(req.user.email);
    const qrCodeUrl = this.mfaService.generateQrCodeUrl(secret.base32, req.user.email);
    
    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  @Post('enable')
  @ApiOperation({ summary: 'Enable MFA with verified token' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  async enableMfa(@Body() dto: EnableMfaDto, @Request() req: any) {
    const result = await this.mfaService.enableMfa(req.user.id, dto.secret, dto.token);
    return {
      message: 'MFA enabled successfully',
      backupCodes: result.backupCodes,
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify MFA token during login' })
  @ApiResponse({ status: 200, description: 'MFA verified successfully' })
  async verifyMfa(@Body() dto: VerifyMfaDto, @Request() req: any) {
    // Session'da temporary user ID varsa kontrol et
    const tempUserId = req.session?.tempUserId;
    if (!tempUserId) {
      throw new Error('No pending login session');
    }

    // TOTP veya backup code kontrol et
    const user = await this.prisma.user.findUnique({
      where: { id: tempUserId },
      select: { mfaSecret: true, backupCodes: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // TOTP kontrol et
    const decryptedSecret = this.encryptionUtil.decrypt(user.mfaSecret, process.env.ENCRYPTION_KEY);
    const isTotpValid = this.mfaService.verifyToken(dto.code, decryptedSecret);

    if (isTotpValid) {
      // Token'ları oluştur ve session'ı tamamla
      // ...
      return { success: true };
    }

    // Backup code kontrol et
    const isBackupCodeValid = await this.mfaService.useBackupCode(tempUserId, dto.code);
    if (isBackupCodeValid) {
      // Token'ları oluştur ve session'ı tamamla
      // ...
      return { success: true };
    }

    throw new Error('Invalid MFA code');
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  async disableMfa(@Body() dto: DisableMfaDto, @Request() req: any) {
    await this.mfaService.disableMfa(req.user.id, dto.password);
    return { message: 'MFA disabled successfully' };
  }
}
```

### Adım 6: Login Flow Güncelleme

```typescript
// apps/backend/src/modules/auth/services/auth.service.ts

async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  // Account lockout kontrolü
  const isLocked = await this.checkAccountLockout(email);
  if (isLocked) {
    const lockoutInfo = await this.getLockoutInfo(email);
    throw new UnauthorizedException(
      `Account locked. Try again in ${lockoutInfo.remainingTime} minutes.`
    );
  }

  // User'ı bul
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await this.recordFailedAttempt(email);
    throw new UnauthorizedException('Invalid credentials');
  }

  // Password kontrolü
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    await this.recordFailedAttempt(email);
    throw new UnauthorizedException('Invalid credentials');
  }

  // MFA kontrolü
  if (user.mfaEnabled) {
    // Temporary session oluştur (MFA beklemede)
    const tempToken = this.generateTempToken(user.id);
    
    return {
      requiresMfa: true,
      tempToken,
      message: 'MFA verification required',
    };
  }

  // MFA yoksa normal login
  const tokens = this.generateTokens(user);
  await this.recordSuccessfulLogin(user.id);

  return {
    user,
    ...tokens,
  };
}

async completeMfaLogin(tempToken: string, mfaCode: string) {
  // Temp token'ı doğrula
  const decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET) as any;
  const userId = decoded.userId;

  // User'ı getir
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.mfaEnabled) {
    throw new UnauthorizedException('Invalid MFA session');
  }

  // MFA kodunu doğrula
  const decryptedSecret = this.encryptionUtil.decrypt(user.mfaSecret, process.env.ENCRYPTION_KEY);
  const isTotpValid = this.mfaService.verifyToken(mfaCode, decryptedSecret);

  if (!isTotpValid) {
    // Backup code kontrol et
    const isBackupCodeValid = await this.mfaService.useBackupCode(userId, mfaCode);
    if (!isBackupCodeValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }
  }

  // Token'ları oluştur
  const tokens = this.generateTokens(user);
  await this.recordSuccessfulLogin(userId);

  return {
    user,
    ...tokens,
  };
}
```

### Adım 7: Frontend MFA UI

```typescript
// apps/frontend/src/app/(auth)/mfa-setup/page.tsx

'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MfaSetupPage() {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleSetup = async () => {
    const response = await fetch('/api/v1/mfa/setup', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setSecret(data.secret);
    setQrCodeUrl(data.qrCodeUrl);
  };

  const handleEnable = async () => {
    const response = await fetch('/api/v1/mfa/enable', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret, token }),
    });
    const data = await response.json();
    setBackupCodes(data.backupCodes);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Setup Two-Factor Authentication</h1>
      
      {!secret ? (
        <button onClick={handleSetup} className="btn-primary">
          Get Setup Code
        </button>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg">
            <p className="mb-4">Scan this QR code with your authenticator app:</p>
            {qrCodeUrl && <QRCodeSVG value={qrCodeUrl} size={200} />}
            <p className="mt-4 text-sm">Or enter this code manually:</p>
            <code className="block mt-2 p-2 bg-gray-100 rounded">{secret}</code>
          </div>

          <div>
            <label className="block mb-2">Enter the 6-digit code from your app:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              className="w-full p-2 border rounded"
              placeholder="123456"
            />
          </div>

          <button onClick={handleEnable} className="btn-primary w-full">
            Enable 2FA
          </button>

          {backupCodes.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Save these backup codes:</h3>
              <ul className="space-y-1">
                {backupCodes.map((code, i) => (
                  <li key={i} className="font-mono text-sm">{code}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-red-600">
                These codes will not be shown again. Save them securely.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Adım 8: Admin Kullanıcıları İçin Zorunlu MFA

```typescript
// apps/backend/src/modules/auth/guards/mfa-required.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MfaRequiredGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin kullanıcılar için MFA zorunlu
    if (user.roles?.includes('ADMIN') || user.roles?.includes('MANAGING_PARTNER')) {
      return user.mfaEnabled === true;
    }

    return true;
  }
}

// Kullanım:
@UseGuards(JwtAuthGuard, MfaRequiredGuard)
@Post('sensitive-operation')
async sensitiveOperation() {
  // ...
}
```

## Test Planı

### 1. MFA Setup Testi
- [ ] Setup endpoint çalışıyor
- [ ] QR code doğru gösteriliyor
- [ ] Authenticator app ile token doğrulanıyor
- [ ] Backup codes oluşturuluyor
- [ ] MFA başarıyla etkinleştiriliyor

### 2. Login Flow Testi
- [ ] MFA'lı kullanıcı login'de MFA istiyor
- [ ] TOTP token ile login başarılı
- [ ] Backup code ile login başarılı
- [ ] Yanlış kod ile login başarısız
- [ ] MFA'sız kullanıcı normal login yapıyor

### 3. MFA Disable Testi
- [ ] Password ile MFA disable ediliyor
- [ ] Yanlış password ile disable başarısız

### 4. Admin MFA Zorunluluk Testi
- [ ] Admin kullanıcı MFA olmadan sensitive endpoint'e erişemiyor
- [ ] Admin kullanıcı MFA ile erişebiliyor

## Deployment Checklist

- [ ] Prisma migration çalıştırıldı
- [ ] otplib ve speakeasy yüklendi
- [ ] MFA service oluşturuldu
- [ ] MFA controller oluşturuldu
- [ ] Login flow güncellendi
- [ ] Frontend MFA UI oluşturuldu
- [ ] Admin MFA zorunluluğu eklendi
- [ ] Testler tamamlandı
- [ ] Dokümantasyon güncellendi

## Maliyet Tahmini

- **Geliştirme Süresi**: 8-12 saat
- **Test Süresi**: 2-4 saat
- **Bakım Süresi**: Minimal
- **Maliyet**: Yok (TOTP ücretsiz)

## Alternatif: SMS-based MFA

Eğer TOTP yerine SMS tercih edilirse:

```bash
npm install twilio
```

```typescript
// SMS gönderme
async sendSmsMfaCode(phoneNumber: string, code: string) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your LexMind AI verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}
```

**Maliyet**: ~$0.05-0.10 per SMS
