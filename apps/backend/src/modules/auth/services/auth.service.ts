import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@database/prisma.service';
import { EmailService } from '../../email/services/email.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { EncryptionUtil } from '@common/encryption.util';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
    }

    // If no password provided, generate a temporary random password
    const passwordToHash = registerDto.password || this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
      },
    });

    // Assign role (use provided role or default to USER)
    const roleName = registerDto.role || 'USER';
    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (role) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Fetch user with roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Log login history
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
      },
    });

    // Send registration email
    try {
      await this.emailService.sendUserRegistrationEmail(
        user.email,
        user.firstName,
        user.lastName,
      );
    } catch (error) {
      console.error('Failed to send registration email:', error);
      // Don't throw error, registration should succeed even if email fails
    }

    if (!userWithRoles) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        firstName: userWithRoles.firstName,
        lastName: userWithRoles.lastName,
        phoneNumber: userWithRoles.phoneNumber || undefined,
        roles: userWithRoles.roles.map((ur: any) => ur.role.name),
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Hesap aktif değil');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // Log failed login attempt
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: false,
        },
      });
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || undefined,
        roles: user.roles.map((ur: any) => ur.role.name),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: true,
      },
    });

    if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.userId, tokenRecord.user.email);

    await this.saveRefreshToken(tokenRecord.userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, token: this.generateRandomToken() },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateRandomPassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async updateAIConfig(userId: string, aiConfig: { provider: string; apiKey: string; model: string; settings?: any }) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-encryption-key';
    
    const encryptedApiKey = EncryptionUtil.encrypt(aiConfig.apiKey, encryptionKey);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiProvider: aiConfig.provider,
        aiApiKey: encryptedApiKey,
        aiModel: aiConfig.model,
        aiSettings: aiConfig.settings || {},
      },
    });

    return { success: true, message: 'AI konfigürasyonu güncellendi' };
  }

  async getAIConfig(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiProvider: true,
        aiApiKey: true,
        aiModel: true,
        aiSettings: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-encryption-key';
    
    let decryptedApiKey = null;
    if (user.aiApiKey) {
      try {
        decryptedApiKey = EncryptionUtil.decrypt(user.aiApiKey, encryptionKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
      }
    }

    return {
      provider: user.aiProvider,
      apiKey: decryptedApiKey ? `${decryptedApiKey.substring(0, 8)}...` : null, // Only return partial key for security
      model: user.aiModel,
      settings: user.aiSettings,
      hasConfig: !!user.aiProvider && !!user.aiApiKey,
    };
  }

  async validateAIKey(provider: string, apiKey: string) {
    try {
      if (provider === 'openai') {
        // Validate OpenAI API key
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 10000,
        });

        if (response.status === 200) {
          return {
            valid: true,
            message: 'OpenAI API anahtarı geçerli',
            models: response.data.data?.map((m: any) => m.id) || [],
          };
        }
      } else if (provider === 'anthropic') {
        // Validate Anthropic API key
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            timeout: 10000,
          },
        );

        if (response.status === 200) {
          return {
            valid: true,
            message: 'Anthropic API anahtarı geçerli',
          };
        }
      }

      throw new BadRequestException('Desteklenmeyen sağlayıcı');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new HttpException(
          'API anahtarı geçersiz veya yetkisiz',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.response?.status === 429) {
        throw new HttpException(
          'API hız sınırı aşıldı. Lütfen daha sonra tekrar deneyin.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (error.code === 'ECONNABORTED') {
        throw new HttpException(
          'API yanıt vermedi. Bağlantı zaman aşımı.',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }
      throw new HttpException(
        `API anahtarı doğrulanamadı: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles.map(ur => ur.role.name),
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles.map(ur => ur.role.name),
    };
  }

  async updateUser(id: string, updateDto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
        email: updateDto.email,
        phoneNumber: updateDto.phoneNumber,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      roles: updatedUser.roles.map(ur => ur.role.name),
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateUserRoles(id: string, roles: string[]) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }

    // Delete existing user roles
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Add new roles
    for (const roleName of roles) {
      const role = await this.prisma.role.findFirst({
        where: { name: roleName },
      });

      if (role) {
        await this.prisma.userRole.create({
          data: {
            userId: id,
            roleId: role.id,
          },
        });
      }
    }

    // Return updated user with roles
    const updatedUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);
    }

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      roles: updatedUser.roles.map(ur => ur.role.name),
    };
  }

  async getUserRolesByEmailAndPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    // Get all users
    const users = await this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(ur => ur.role.name),
      demoUsers: users.map(u => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        password: 'demo123', // Demo password for testing
        roles: u.roles.map(ur => ur.role.name),
      })),
    };
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir' };
    }

    // Generate reset token
    const resetToken = this.generateRandomToken() + this.generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send email with reset link
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        user.lastName,
        resetToken,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error, user should still be able to reset password
    }

    return { message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: resetPasswordDto.token },
      include: {
        user: true,
      },
    });

    if (!passwordReset) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş token');
    }

    if (passwordReset.usedAt) {
      throw new BadRequestException('Bu token zaten kullanılmış');
    }

    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Token süresi dolmuş');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: passwordReset.userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Şifre başarıyla sıfırlandı' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mevcut şifre hatalı');
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException('Yeni şifre mevcut şifre ile aynı olamaz');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    // Send password change notification email
    try {
      await this.emailService.sendPasswordChangeNotificationEmail(
        user.email,
        user.firstName,
        user.lastName,
      );
    } catch (error) {
      console.error('Failed to send password change notification email:', error);
      // Don't throw error, password change should succeed even if email fails
    }

    return { message: 'Şifre başarıyla değiştirildi' };
  }
}
