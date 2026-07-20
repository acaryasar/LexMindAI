import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CHECK = 'CHECK',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Tutar' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Ödeme yöntemi', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: 'Ödeme tarihi' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Notlar', required: false })
  @IsString()
  notes?: string;
}
