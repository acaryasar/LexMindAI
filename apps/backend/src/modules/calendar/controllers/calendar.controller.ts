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
import { CalendarService } from '../services/calendar.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @ApiOperation({ summary: 'Yeni etkinlik oluştur' })
  @ApiResponse({ status: 201, description: 'Etkinlik başarıyla oluşturuldu' })
  createEvent(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    return this.calendarService.createEvent(createEventDto, req.user.id);
  }

  @Get('events')
  @ApiOperation({ summary: 'Etkinlik listesi' })
  @ApiResponse({ status: 200, description: 'Etkinlik listesi getirildi' })
  getEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Request() req?: any,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.calendarService.getEvents(start, end, type, req?.user?.id, req?.user?.roles);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Etkinlik detayı' })
  @ApiResponse({ status: 200, description: 'Etkinlik detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı' })
  getEvent(@Param('id') id: string) {
    return this.calendarService.getEvent(id);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Etkinlik güncelle' })
  @ApiResponse({ status: 200, description: 'Etkinlik başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı' })
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req: any) {
    return this.calendarService.updateEvent(id, updateEventDto, req.user.id);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Etkinlik sil' })
  @ApiResponse({ status: 204, description: 'Etkinlik başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı' })
  deleteEvent(@Param('id') id: string, @Request() req: any) {
    return this.calendarService.deleteEvent(id, req.user.id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Yaklaşan etkinlikler' })
  @ApiResponse({ status: 200, description: 'Yaklaşan etkinlikler getirildi' })
  getUpcomingEvents(@Query('days') days?: string, @Request() req?: any) {
    const daysCount = days ? parseInt(days) : 7;
    return this.calendarService.getUpcomingEvents(daysCount, req?.user?.id, req?.user?.roles);
  }
}
