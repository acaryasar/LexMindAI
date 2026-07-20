import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token zorunludur' })
  @IsString()
  refreshToken: string;
}
