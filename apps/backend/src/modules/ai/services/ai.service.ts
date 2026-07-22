import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AIGatewayService } from '../gateway/ai-gateway.service';
import { ChatDto } from '../dto/chat.dto';
import { DocumentAnalysisDto } from '../dto/document-analysis.dto';
import { LegalWritingDto } from '../dto/legal-writing.dto';
import { ResearchDto } from '../dto/research.dto';

@Injectable()
export class AIService {
  constructor(
    private prisma: PrismaService,
    private aiGateway: AIGatewayService,
  ) {}

  async chat(chatDto: ChatDto, userId: string) {
    let conversationId = chatDto.conversationId;

    // Create new conversation if not provided
    if (!conversationId) {
      const conversation = await this.prisma.aIConversation.create({
        data: {
          title: chatDto.message.substring(0, 50),
          userId,
          model: 'gpt-4',
          status: 'ACTIVE',
        },
      });
      conversationId = conversation.id;
    }

    // Build context
    const context: any = {};
    if (chatDto.caseId) context.caseId = chatDto.caseId;
    if (chatDto.clientId) context.clientId = chatDto.clientId;
    if (chatDto.documentIds) context.documentIds = chatDto.documentIds;

    // Get AI response
    const { response, usage } = await this.aiGateway.chat(
      chatDto.message,
      conversationId,
      context,
    );

    // Save user message
    await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: chatDto.message,
        tokenUsage: usage?.prompt_tokens,
      },
    });

    // Save AI response
    await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: response,
        tokenUsage: usage?.completion_tokens,
        responseTime: usage?.total_tokens || 0,
      },
    });

    return {
      conversationId,
      response,
      usage,
    };
  }

  async getConversations(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
  }

  async getConversation(conversationId: string) {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Konuşma bulunamadı');
    }

    return conversation;
  }

  async deleteConversation(conversationId: string) {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Konuşma bulunamadı');
    }

    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async documentAnalysis(documentAnalysisDto: DocumentAnalysisDto, userId: string) {
    const response = await this.aiGateway.documentAnalysis(
      documentAnalysisDto.documentId,
      documentAnalysisDto.analysisType || 'general',
      documentAnalysisDto.prompt,
      userId,
    );

    return {
      documentId: documentAnalysisDto.documentId,
      analysis: response,
    };
  }

  async legalWriting(legalWritingDto: LegalWritingDto, userId: string) {
    const response = await this.aiGateway.legalWriting(
      legalWritingDto.writingType,
      legalWritingDto.subject,
      legalWritingDto.context,
      legalWritingDto.tone,
      userId,
    );

    return {
      writingType: legalWritingDto.writingType,
      subject: legalWritingDto.subject,
      content: response,
    };
  }

  async research(researchDto: ResearchDto, userId: string) {
    const response = await this.aiGateway.research(
      researchDto.query,
      researchDto.documentIds || [],
      userId,
    );

    return {
      query: researchDto.query,
      results: response,
    };
  }

  async getUsageReports(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return this.prisma.aIUsageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPrompts() {
    return this.prisma.aIPrompt.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { category: 'asc', name: 'asc' },
    });
  }

  async generateSummary(body: { type: string; description: string; title?: string; reason?: string }, userId: string) {
    // Build prompt for AI summary
    const prompt = `
      Aşağıdaki öneri için detaylı bir AI özeti oluştur:
      
      Tür: ${body.type}
      Başlık: ${body.title || 'Belirtilmemiş'}
      Açıklama: ${body.description}
      Öneri: ${body.reason || 'Belirtilmemiş'}
      
      Lütfen şu formatta bir özet oluştur:
      1. Konu ve açıklama özeti
      2. Detaylı analiz (öncelik seviyesi, güven skoru, iş etkisi, yasal etkisi)
      3. Önerilen eylemler (adım adım)
      4. Ek notlar ve uyarılar
    `;

    try {
      const { response, usage } = await this.aiGateway.chat(prompt, undefined, { type: 'summary' });
      
      return {
        summary: response,
        usage,
      };
    } catch (error) {
      // Fallback to basic summary if AI fails
      return {
        summary: `
          <strong>AI Özet:</strong>
          
          <p><strong>Konu:</strong> ${body.title || 'Belirtilmemiş'}</p>
          <p><strong>Açıklama:</strong> ${body.description}</p>
          <p><strong>Öneri:</strong> ${body.reason || 'Belirtilmemiş'}</p>
          
          <p><strong>Detaylı Analiz:</strong></p>
          <ul>
            <li>Bu öneri sistem tarafından otomatik olarak oluşturulmuştur</li>
            <li>Tür: ${body.type}</li>
          </ul>
          
          <p><strong>Önerilen Eylemler:</strong></p>
          <ol>
            <li>Öncelikli olarak bu konuyu inceleyin</li>
            <li>İlgili müvekkil ile iletişime geçin</li>
            <li>Gerekirse ek bilgi toplayın</li>
          </ol>
        `,
        usage: null,
      };
    }
  }
}
