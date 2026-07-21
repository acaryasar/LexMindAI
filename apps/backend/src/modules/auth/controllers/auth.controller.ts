import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
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

  @Post('validate-ai-key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI API anahtarını doğrula' })
  @ApiResponse({ status: 200, description: 'API anahtarı geçerli' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 400, description: 'Geçersiz API anahtarı' })
  async validateAIKey(@Request() req: any, @Body() body: { provider: string; apiKey: string }) {
    return this.authService.validateAIKey(body.provider, body.apiKey);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm kullanıcıları getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcılar getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getUsers(@Request() req: any) {
    return this.authService.getUsers();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayları getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async getUserById(@Request() req: any, @Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async updateUser(@Request() req: any, @Param('id') id: string, @Body() updateDto: any) {
    return this.authService.updateUser(id, updateDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı sil' })
  @ApiResponse({ status: 204, description: 'Kullanıcı silindi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Put('users/:id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı rollerini güncelle' })
  @ApiResponse({ status: 200, description: 'Roller güncellendi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async updateUserRoles(@Request() req: any, @Param('id') id: string, @Body() body: { roles: string[] }) {
    return this.authService.updateUserRoles(id, body.roles);
  }

  @Post('demo-roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demo kullanıcı rollerini getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı rolleri getirildi' })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async getDemoRoles(@Body() body: { email: string; password: string }) {
    return this.authService.getUserRolesByEmailAndPassword(body.email, body.password);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm rolleri getir' })
  @ApiResponse({ status: 200, description: 'Roller getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getRoles(@Request() req: any) {
    return this.authService.getRoles();
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Şifremi unuttum' })
  @ApiResponse({ status: 200, description: 'Şifre sıfırlama bağlantısı gönderildi' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Şifre sıfırlama' })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla sıfırlandı' })
  @ApiResponse({ status: 400, description: 'Geçersiz veya süresi dolmuş token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Şifre değiştirme' })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla değiştirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim veya mevcut şifre hatalı' })
  @ApiResponse({ status: 400, description: 'Geçersiz şifre' })
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
