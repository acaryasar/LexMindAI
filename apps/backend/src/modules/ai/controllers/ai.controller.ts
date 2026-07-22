import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from '../services/ai.service';
import { ChatDto } from '../dto/chat.dto';
import { DocumentAnalysisDto } from '../dto/document-analysis.dto';
import { LegalWritingDto } from '../dto/legal-writing.dto';
import { ResearchDto } from '../dto/research.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI Chat' })
  @ApiResponse({ status: 200, description: 'Chat response' })
  chat(@Body() chatDto: ChatDto, @Request() req: any) {
    return this.aiService.chat(chatDto, req.user.id);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Konuşma listesi' })
  @ApiResponse({ status: 200, description: 'Konuşma listesi getirildi' })
  getConversations(@Request() req: any) {
    return this.aiService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Konuşma detayı' })
  @ApiResponse({ status: 200, description: 'Konuşma detayı getirildi' })
  @ApiResponse({ status: 404, description: 'Konuşma bulunamadı' })
  getConversation(@Param('id') id: string) {
    return this.aiService.getConversation(id);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Konuşma sil' })
  @ApiResponse({ status: 204, description: 'Konuşma başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Konuşma bulunamadı' })
  deleteConversation(@Param('id') id: string) {
    return this.aiService.deleteConversation(id);
  }

  @Post('document-analysis')
  @ApiOperation({ summary: 'Doküman analizi' })
  @ApiResponse({ status: 200, description: 'Analiz tamamlandı' })
  documentAnalysis(@Body() documentAnalysisDto: DocumentAnalysisDto, @Request() req: any) {
    return this.aiService.documentAnalysis(documentAnalysisDto, req.user.id);
  }

  @Post('legal-writing')
  @ApiOperation({ summary: 'Hukuki metin yazma' })
  @ApiResponse({ status: 200, description: 'Metin oluşturuldu' })
  legalWriting(@Body() legalWritingDto: LegalWritingDto, @Request() req: any) {
    return this.aiService.legalWriting(legalWritingDto, req.user.id);
  }

  @Post('research')
  @ApiOperation({ summary: 'Hukuki araştırma' })
  @ApiResponse({ status: 200, description: 'Araştırma tamamlandı' })
  research(@Body() researchDto: ResearchDto, @Request() req: any) {
    return this.aiService.research(researchDto, req.user.id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'AI kullanım raporları' })
  @ApiResponse({ status: 200, description: 'Kullanım raporları getirildi' })
  getUsageReports(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.aiService.getUsageReports(req.user.id, start, end);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'Prompt listesi' })
  @ApiResponse({ status: 200, description: 'Prompt listesi getirildi' })
  getPrompts() {
    return this.aiService.getPrompts();
  }

  @Post('summary')
  @ApiOperation({ summary: 'AI Özet oluştur' })
  @ApiResponse({ status: 200, description: 'Özet oluşturuldu' })
  generateSummary(@Body() body: { type: string; description: string; title?: string; reason?: string }, @Request() req: any) {
    return this.aiService.generateSummary(body, req.user.id);
  }
}
