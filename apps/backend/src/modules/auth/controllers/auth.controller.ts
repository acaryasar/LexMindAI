import { Controller, Post, Body, Get, Put, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla kaydedildi', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'E-posta zaten kayıtlı' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Access token yenileme' })
  @ApiResponse({ status: 200, description: 'Token başarıyla yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({ status: 204, description: 'Çıkış başarılı' })
  async logout(@Request() req: any): Promise<void> {
    await this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı profili' })
  @ApiResponse({ status: 200, description: 'Profil bilgileri getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('ai-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI API konfigürasyonunu güncelle' })
  @ApiResponse({ status: 200, description: 'AI konfigürasyonu güncellendi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async updateAIConfig(@Request() req: any, @Body() aiConfig: { provider: string; apiKey: string; model: string; settings?: any }) {
    return this.authService.updateAIConfig(req.user.id, aiConfig);
  }

  @Get('ai-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI API konfigürasyonunu getir' })
  @ApiResponse({ status: 200, description: 'AI konfigürasyonu getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getAIConfig(@Request() req: any) {
    return this.authService.getAIConfig(req.user.id);
  }
}
