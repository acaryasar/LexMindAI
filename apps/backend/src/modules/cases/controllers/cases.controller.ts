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
import { CasesService } from '../services/cases.service';
import { CreateCaseDto } from '../dto/create-case.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';
import { CreateCaseNoteDto } from '../dto/create-case-note.dto';
import { CreateCaseHearingDto } from '../dto/create-case-hearing.dto';
import { AssignCaseLawyerDto } from '../dto/assign-lawyer.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Cases')
@Controller('cases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni dava oluştur' })
  @ApiResponse({ status: 201, description: 'Dava başarıyla oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Dava numarası zaten kayıtlı' })
  create(@Body() createCaseDto: CreateCaseDto, @Request() req: any) {
    return this.casesService.create(createCaseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Dava listesi' })
  @ApiResponse({ status: 200, description: 'Dava listesi getirildi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    return this.casesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
      req?.user?.id,
      req?.user?.role,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dava detayı' })
  @ApiResponse({ status: 200, description: 'Dava detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Dava güncelle' })
  @ApiResponse({ status: 200, description: 'Dava başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto, @Request() req: any) {
    return this.casesService.update(id, updateCaseDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dava sil' })
  @ApiResponse({ status: 204, description: 'Dava başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.casesService.remove(id, req.user.id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Dava notu ekle' })
  @ApiResponse({ status: 201, description: 'Not başarıyla eklendi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  addNote(@Param('id') id: string, @Body() createNoteDto: CreateCaseNoteDto, @Request() req: any) {
    return this.casesService.addNote(id, createNoteDto, req.user.id);
  }

  @Post(':id/hearings')
  @ApiOperation({ summary: 'Duruşma ekle' })
  @ApiResponse({ status: 201, description: 'Duruşma başarıyla eklendi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  addHearing(
    @Param('id') id: string,
    @Body() createHearingDto: CreateCaseHearingDto,
    @Request() req: any,
  ) {
    return this.casesService.addHearing(id, createHearingDto, req.user.id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Dava zaman çizelgesi' })
  @ApiResponse({ status: 200, description: 'Zaman çizelgesi getirildi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  getTimeline(@Param('id') id: string) {
    return this.casesService.getTimeline(id);
  }

  @Post(':id/lawyers')
  @ApiOperation({ summary: 'Davaya avukat ata' })
  @ApiResponse({ status: 201, description: 'Avukat başarıyla atandı' })
  @ApiResponse({ status: 404, description: 'Dava veya avukat bulunamadı' })
  @ApiResponse({ status: 409, description: 'Avukat zaten atanmış' })
  assignLawyer(
    @Param('id') id: string,
    @Body() assignLawyerDto: AssignCaseLawyerDto,
    @Request() req: any,
  ) {
    return this.casesService.assignLawyer(id, assignLawyerDto, req.user.id);
  }

  @Delete(':id/lawyers/:lawyerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Davadan avukat kaldır' })
  @ApiResponse({ status: 204, description: 'Avukat başarıyla kaldırıldı' })
  @ApiResponse({ status: 404, description: 'Atama bulunamadı' })
  removeLawyer(
    @Param('id') id: string,
    @Param('lawyerId') lawyerId: string,
    @Request() req: any,
    @Body() body?: { reason?: string },
  ) {
    return this.casesService.removeLawyer(id, lawyerId, req.user.id, body?.reason);
  }

  @Get(':id/lawyers')
  @ApiOperation({ summary: 'Dava avukatlarını getir' })
  @ApiResponse({ status: 200, description: 'Avukat listesi getirildi' })
  @ApiResponse({ status: 404, description: 'Dava bulunamadı' })
  getCaseLawyers(@Param('id') id: string) {
    return this.casesService.getCaseLawyers(id);
  }
}
