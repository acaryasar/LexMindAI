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
import { HearingsService } from '../services/hearings.service';
import { CreateHearingDto } from '../dto/create-hearing.dto';
import { UpdateHearingDto } from '../dto/update-hearing.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Hearings')
@Controller('hearings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HearingsController {
  constructor(private readonly hearingsService: HearingsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni duruşma oluştur' })
  @ApiResponse({ status: 201, description: 'Duruşma başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  create(@Body() createHearingDto: CreateHearingDto, @Request() req: any) {
    return this.hearingsService.create(createHearingDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Duruşma listesi' })
  @ApiResponse({ status: 200, description: 'Duruşma listesi getirildi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('caseId') caseId?: string,
  ) {
    return this.hearingsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      caseId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Duruşma detayı' })
  @ApiResponse({ status: 200, description: 'Duruşma detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Duruşma bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.hearingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Duruşma güncelle' })
  @ApiResponse({ status: 200, description: 'Duruşma başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Duruşma bulunamadı' })
  update(@Param('id') id: string, @Body() updateHearingDto: UpdateHearingDto) {
    return this.hearingsService.update(id, updateHearingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Duruşma sil' })
  @ApiResponse({ status: 204, description: 'Duruşma başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Duruşma bulunamadı' })
  remove(@Param('id') id: string) {
    return this.hearingsService.remove(id);
  }
}
