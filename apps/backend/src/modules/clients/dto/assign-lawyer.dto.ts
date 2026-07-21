import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class AssignLawyerDto {
  @ApiProperty({ description: 'Avukat kullanıcı ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Ana avukat mı?', required: false })
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Atama nedeni', required: false })
  @IsString()
  reason?: string;
}
