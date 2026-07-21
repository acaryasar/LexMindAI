import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty, IsEnum } from 'class-validator';

export enum CaseLawyerRole {
  LEAD_LAWYER = 'LEAD_LAWYER',
  ASSOCIATE = 'ASSOCIATE',
  OBSERVER = 'OBSERVER',
}

export class AssignCaseLawyerDto {
  @ApiProperty({ description: 'Avukat kullanıcı ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Rol', enum: CaseLawyerRole })
  @IsEnum(CaseLawyerRole)
  role: CaseLawyerRole;

  @ApiProperty({ description: 'Ana avukat mı?', required: false })
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Atama nedeni', required: false })
  @IsString()
  reason?: string;
}
