import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async chat(
    message: string,
    conversationId?: string,
    context?: any,
  ): Promise<{ response: string; usage?: any }> {
    try {
      const startTime = Date.now();

      // Build system prompt
      const systemPrompt = await this.buildSystemPrompt(context);

      // Get conversation history if conversationId provided
      const messages = await this.buildMessages(message, conversationId, systemPrompt);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseTime = Date.now() - startTime;

      // Log usage
      await this.logUsage('chat', completion.usage, responseTime);

      return {
        response: completion.choices[0].message.content || '',
        usage: completion.usage,
      };
    } catch (error) {
      this.logger.error('AI Chat error:', error);
      throw error;
    }
  }

  async documentAnalysis(documentId: string, analysisType: string, prompt?: string): Promise<string> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // In production, you would extract text from the document here
      // For now, we'll use a placeholder
      const documentContent = `Document: ${document.name}\nType: ${document.mimeType}\nSize: ${document.size}`;

      const systemPrompt = `You are a legal document analysis assistant. Analyze the following document based on the requested analysis type: ${analysisType}.`;

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt || 'Analyze this document'}\n\n${documentContent}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Document analysis error:', error);
      throw error;
    }
  }

  async legalWriting(writingType: string, subject: string, context?: string, tone?: string): Promise<string> {
    try {
      const systemPrompt = `You are a legal writing assistant. Write a ${writingType} with the following subject: ${subject}. Use a ${tone || 'professional'} tone.`;

      const userPrompt = context ? `Context: ${context}\n\nSubject: ${subject}` : `Subject: ${subject}`;

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Legal writing error:', error);
      throw error;
    }
  }

  async research(query: string, documentIds?: string[]): Promise<string> {
    try {
      let context = '';

      // If documentIds provided, search in those documents
      if (documentIds && documentIds.length > 0) {
        const documents = await this.prisma.document.findMany({
          where: {
            id: { in: documentIds },
          },
          select: {
            name: true,
            description: true,
          },
        });

        context = 'Relevant documents:\n' + documents.map((d) => `- ${d.name}: ${d.description || ''}`).join('\n');
      }

      const systemPrompt = `You are a legal research assistant. Help with legal research based on the provided query and context.`;

      const userPrompt = context ? `Context:\n${context}\n\nQuery: ${query}` : `Query: ${query}`;

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Research error:', error);
      throw error;
    }
  }

  private async buildSystemPrompt(context?: any): Promise<string> {
    let prompt = 'You are a helpful legal assistant for LexMind AI, a legal practice management system.';

    if (context) {
      if (context.caseId) {
        const caseData = await this.prisma.case.findUnique({
          where: { id: context.caseId },
          select: { title: true, type: true, description: true },
        });
        if (caseData) {
          prompt += `\nCurrent case: ${caseData.title} (${caseData.type})\nDescription: ${caseData.description || ''}`;
        }
      }

      if (context.clientId) {
        const clientData = await this.prisma.client.findUnique({
          where: { id: context.clientId },
          select: { firstName: true, lastName: true, notes: true },
        });
        if (clientData) {
          prompt += `\nClient: ${clientData.firstName} ${clientData.lastName}\nNotes: ${clientData.notes || ''}`;
        }
      }
    }

    return prompt;
  }

  private async buildMessages(message: string, conversationId?: string, systemPrompt?: string) {
    const messages: any[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // If conversationId provided, get conversation history
    if (conversationId) {
      const conversation = await this.prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages
          },
        },
      });

      if (conversation) {
        conversation.messages.forEach((msg) => {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        });
      }
    }

    messages.push({ role: 'user', content: message });

    return messages;
  }

  private async logUsage(service: string, usage: any, responseTime: number) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId: 'system', // In real app, this would be the actual user ID
          model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          responseTime,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log AI usage:', error);
    }
  }
}
