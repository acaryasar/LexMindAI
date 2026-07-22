import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './services/reports.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('hearing-schedule')
  @ApiOperation({ summary: 'Duruşma takvimi raporu' })
  @ApiResponse({ status: 200, description: 'Duruşma takvimi raporu getirildi' })
  getHearingScheduleReport(
    @Query('filter') filter?: 'upcoming' | 'past' | 'all',
    @Request() req?: any,
  ) {
    return this.reportsService.getHearingScheduleReport(filter, req?.user?.id, req?.user?.role);
  }

  @Get('ai-analysis')
  @ApiOperation({ summary: 'AI analiz raporu' })
  @ApiResponse({ status: 200, description: 'AI analiz raporu getirildi' })
  getAIAnalysisReport(@Request() req?: any) {
    return this.reportsService.getAIAnalysisReport(req?.user?.id, req?.user?.role);
  }

  @Get('case-status')
  @ApiOperation({ summary: 'Dava durum raporu' })
  @ApiResponse({ status: 200, description: 'Dava durum raporu getirildi' })
  getCaseStatusReport(
    @Query('filter') filter?: 'active' | 'pending' | 'completed' | 'all',
    @Request() req?: any,
  ) {
    return this.reportsService.getCaseStatusReport(filter, req?.user?.id, req?.user?.role);
  }

  @Get('client')
  @ApiOperation({ summary: 'Müvekkil raporu' })
  @ApiResponse({ status: 200, description: 'Müvekkil raporu getirildi' })
  getClientReport(@Request() req?: any) {
    return this.reportsService.getClientReport(req?.user?.id, req?.user?.role);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Finansal raporu' })
  @ApiResponse({ status: 200, description: 'Finansal raporu getirildi' })
  getFinanceReport(
    @Query('filter') filter?: 'income' | 'expense' | 'all',
    @Request() req?: any,
  ) {
    return this.reportsService.getFinanceReport(filter, req?.user?.id, req?.user?.role);
  }

  @Get('task')
  @ApiOperation({ summary: 'Görev raporu' })
  @ApiResponse({ status: 200, description: 'Görev raporu getirildi' })
  getTaskReport(
    @Query('filter') filter?: 'pending' | 'in_progress' | 'completed' | 'all',
    @Request() req?: any,
  ) {
    return this.reportsService.getTaskReport(filter, req?.user?.id, req?.user?.role);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Aktivite raporu' })
  @ApiResponse({ status: 200, description: 'Aktivite raporu getirildi' })
  getActivityReport(
    @Query('filter') filter?: 'case' | 'document' | 'finance' | 'ai' | 'hearing' | 'task' | 'all',
    @Request() req?: any,
  ) {
    return this.reportsService.getActivityReport(filter, req?.user?.id, req?.user?.role);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Performans raporu' })
  @ApiResponse({ status: 200, description: 'Performans raporu getirildi' })
  getPerformanceReport(@Request() req?: any) {
    return this.reportsService.getPerformanceReport(req?.user?.id, req?.user?.role);
  }
}
