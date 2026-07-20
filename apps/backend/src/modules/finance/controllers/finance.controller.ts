import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from '../services/finance.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoices
  @Post('invoices')
  @ApiOperation({ summary: 'Yeni fatura oluştur' })
  @ApiResponse({ status: 201, description: 'Fatura başarıyla oluşturuldu' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
    return this.financeService.createInvoice(createInvoiceDto, req.user.id);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Fatura listesi' })
  @ApiResponse({ status: 200, description: 'Fatura listesi getirildi' })
  getInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getInvoices(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Fatura detayı' })
  @ApiResponse({ status: 200, description: 'Fatura detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Fatura bulunamadı' })
  getInvoice(@Param('id') id: string) {
    return this.financeService.getInvoice(id);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: 'Fatura güncelle' })
  @ApiResponse({ status: 200, description: 'Fatura başarıyla güncellendi' })
  updateInvoice(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req: any) {
    return this.financeService.updateInvoice(id, updateInvoiceDto, req.user.id);
  }

  // Payments
  @Post('invoices/:id/payments')
  @ApiOperation({ summary: 'Ödeme ekle' })
  @ApiResponse({ status: 201, description: 'Ödeme başarıyla eklendi' })
  addPayment(@Param('id') id: string, @Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.financeService.addPayment(id, createPaymentDto, req.user.id);
  }

  // Expenses
  @Post('expenses')
  @ApiOperation({ summary: 'Yeni gider oluştur' })
  @ApiResponse({ status: 201, description: 'Gider başarıyla oluşturuldu' })
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    return this.financeService.createExpense(createExpenseDto, req.user.id);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Gider listesi' })
  @ApiResponse({ status: 200, description: 'Gider listesi getirildi' })
  getExpenses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.financeService.getExpenses(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      category,
    );
  }

  // Time Entries
  @Post('time-entries')
  @ApiOperation({ summary: 'Yeni zaman kaydı oluştur' })
  @ApiResponse({ status: 201, description: 'Zaman kaydı başarıyla oluşturuldu' })
  createTimeEntry(@Body() createTimeEntryDto: CreateTimeEntryDto, @Request() req: any) {
    return this.financeService.createTimeEntry(createTimeEntryDto, req.user.id);
  }

  @Get('time-entries')
  @ApiOperation({ summary: 'Zaman kayıtları listesi' })
  @ApiResponse({ status: 200, description: 'Zaman kayıtları getirildi' })
  getTimeEntries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    return this.financeService.getTimeEntries(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      userId,
    );
  }

  // Reports
  @Get('reports/summary')
  @ApiOperation({ summary: 'Finansal özet raporu' })
  @ApiResponse({ status: 200, description: 'Özet raporu getirildi' })
  getSummaryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financeService.getSummaryReport(start, end);
  }
}
