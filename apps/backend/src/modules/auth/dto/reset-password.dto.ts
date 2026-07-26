import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  @IsNotEmpty({ message: 'Token zorunludur' })
  token: string;

  @ApiProperty({ example: 'NewPassword123!@' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre zorunludur' })
  @MinLength(12, { message: 'Şifre en az 12 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
  })
  password: string;
}
