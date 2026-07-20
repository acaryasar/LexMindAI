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
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { CreateClientContactDto } from '../dto/create-client-contact.dto';
import { CreateClientNoteDto } from '../dto/create-client-note.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  @ApiResponse({ status: 201, description: 'Müşteri başarıyla oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Müşteri zaten kayıtlı' })
  create(@Body() createClientDto: CreateClientDto, @Request() req: any) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Müşteri listesi' })
  @ApiResponse({ status: 200, description: 'Müşteri listesi getirildi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayı' })
  @ApiResponse({ status: 200, description: 'Müşteri detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müşteri güncelle' })
  @ApiResponse({ status: 200, description: 'Müşteri başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req: any) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Müşteri sil' })
  @ApiResponse({ status: 204, description: 'Müşteri başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.clientsService.remove(id, req.user.id);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Müşteri iletişim bilgisi ekle' })
  @ApiResponse({ status: 201, description: 'İletişim bilgisi başarıyla eklendi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  addContact(
    @Param('id') id: string,
    @Body() createContactDto: CreateClientContactDto,
    @Request() req: any,
  ) {
    return this.clientsService.addContact(id, createContactDto, req.user.id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Müşteri notu ekle' })
  @ApiResponse({ status: 201, description: 'Not başarıyla eklendi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  addNote(@Param('id') id: string, @Body() createNoteDto: CreateClientNoteDto, @Request() req: any) {
    return this.clientsService.addNote(id, createNoteDto, req.user.id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Müşteri zaman çizelgesi' })
  @ApiResponse({ status: 200, description: 'Zaman çizelgesi getirildi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  getTimeline(@Param('id') id: string) {
    return this.clientsService.getTimeline(id);
  }
}
