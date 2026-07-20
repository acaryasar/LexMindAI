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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from '../services/documents.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Dosya yükle' })
  @ApiResponse({ status: 201, description: 'Dosya başarıyla yüklendi' })
  @ApiResponse({ status: 400, description: 'Dosya yüklenemedi' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req: any,
  ) {
    return this.documentsService.upload(file, uploadDocumentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Dosya listesi' })
  @ApiResponse({ status: 200, description: 'Dosya listesi getirildi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.documentsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      category,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Dosya ara' })
  @ApiResponse({ status: 200, description: 'Arama sonuçları getirildi' })
  search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentsService.search(
      query,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dosya detayı' })
  @ApiResponse({ status: 200, description: 'Dosya detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Dosya güncelle' })
  @ApiResponse({ status: 200, description: 'Dosya başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Request() req: any) {
    return this.documentsService.update(id, updateDocumentDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dosya sil' })
  @ApiResponse({ status: 204, description: 'Dosya başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.remove(id, req.user.id);
  }

  @Post(':id/versions')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Dosya versiyonu oluştur' })
  @ApiResponse({ status: 201, description: 'Versiyon başarıyla oluşturuldu' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  createVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('notes') notes?: string,
    @Request() req?: any,
  ) {
    return this.documentsService.createVersion(id, file, notes, req?.user.id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Dosya paylaş' })
  @ApiResponse({ status: 201, description: 'Dosya başarıyla paylaşıldı' })
  @ApiResponse({ status: 404, description: 'Dosya bulunamadı' })
  shareDocument(
    @Param('id') id: string,
    @Body('sharedWith') sharedWith: string,
    @Body('expiresAt') expiresAt?: Date,
    @Request() req?: any,
  ) {
    return this.documentsService.shareDocument(id, sharedWith, expiresAt, req?.user.id);
  }
}
