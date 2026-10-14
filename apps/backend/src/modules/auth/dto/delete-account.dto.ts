import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ description: 'Onay için mevcut şifre' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
