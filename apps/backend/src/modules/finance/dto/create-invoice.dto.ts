import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Fatura numarası' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Müşteri ID' })
  @IsString()
  clientId: string;

  @ApiProperty({ description: 'Tutar' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Durum', enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @ApiProperty({ description: 'Son ödeme tarihi' })
  @IsDateString()
  dueDate: string;
}
