import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { PrismaService } from '@database/prisma.service';
import { EncryptionUtil } from '@common/encryption.util';
import { AIProviderFactory } from '../providers/provider-factory.service';

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private aiProviderFactory: AIProviderFactory,
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
    userId?: string,
  ): Promise<{ response: string; usage?: any }> {
    let aiConfig = null;
    try {
      const startTime = Date.now();

      // Get user-specific AI configuration
      aiConfig = await this.getUserAIConfig(userId);

      // Determine provider to use
      const providerName = aiConfig?.provider || this.configService.get<string>('DEFAULT_AI_PROVIDER', 'ollama');

      // Build system prompt
      const systemPrompt = await this.buildSystemPrompt(context);

      // Get conversation history if conversationId provided
      const messages = await this.buildMessages(message, conversationId, systemPrompt);

      // Use AIProviderFactory for chat
      const response = await this.aiProviderFactory.chat(messages, {
        model: aiConfig?.model || this.configService.get<string>('OLLAMA_MODEL', 'mistral:latest'),
        temperature: (aiConfig?.settings as any)?.temperature || 0.7,
        maxTokens: (aiConfig?.settings as any)?.maxTokens || 2000,
      }, providerName);

      const responseTime = Date.now() - startTime;

      // Log usage
      await this.logUsage('chat', response.usage, responseTime, userId);

      return {
        response: response.content,
        usage: response.usage,
      };
    } catch (error) {
      this.logger.error('AI Chat error:', error);
      this.logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId,
        hasConfig: !!aiConfig,
        hasApiKey: !!aiConfig?.apiKey,
        provider: aiConfig?.provider,
      });
      throw error;
    }
  }

  async documentAnalysis(documentId: string, analysisType: string, prompt?: string, userId?: string): Promise<string> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Get user-specific AI configuration
      const aiConfig = await this.getUserAIConfig(userId);

      // Initialize OpenAI with user's API key or fallback to default
      const openai = this.getOpenAIClient(aiConfig);

      // In production, you would extract text from the document here
      // For now, we'll use a placeholder
      const documentContent = `Document: ${document.name}\nType: ${document.mimeType}\nSize: ${document.size}`;

      const systemPrompt = `Sen bir hukuk belge analiz asistanısın. Aşağıdaki belgeyi istenen analiz türüne göre analiz et: ${analysisType}. Her zaman Türkçe dilinde cevap vermelisin.`;

      const completion = await openai.chat.completions.create({
        model: aiConfig?.model || this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt || 'Analyze this document'}\n\n${documentContent}` },
        ],
        temperature: (aiConfig?.settings as any)?.temperature || 0.7,
        max_tokens: (aiConfig?.settings as any)?.maxTokens || 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Document analysis error:', error);
      throw error;
    }
  }

  async legalWriting(writingType: string, subject: string, context?: string, tone?: string, userId?: string): Promise<string> {
    try {
      // Get user-specific AI configuration
      const aiConfig = await this.getUserAIConfig(userId);

      // Initialize OpenAI with user's API key or fallback to default
      const openai = this.getOpenAIClient(aiConfig);

      const systemPrompt = `Sen bir hukuk yazım asistanısın. Aşağıdaki konuyla ilgili bir ${writingType} yaz: ${subject}. ${tone || 'profesyonel'} bir ton kullan. Her zaman Türkçe dilinde cevap vermelisin.`;

      const userPrompt = context ? `Context: ${context}\n\nSubject: ${subject}` : `Subject: ${subject}`;

      const completion = await openai.chat.completions.create({
        model: aiConfig?.model || this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: (aiConfig?.settings as any)?.temperature || 0.7,
        max_tokens: (aiConfig?.settings as any)?.maxTokens || 3000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Legal writing error:', error);
      throw error;
    }
  }

  async research(query: string, documentIds?: string[], userId?: string): Promise<string> {
    try {
      // Get user-specific AI configuration
      const aiConfig = await this.getUserAIConfig(userId);

      // Initialize OpenAI with user's API key or fallback to default
      const openai = this.getOpenAIClient(aiConfig);

      let context = '';

      // If documentIds provided, search in those documents
      if (documentIds && documentIds.length > 0) {
        const documents = await this.prisma.document.findMany({
          where: {
            id: { in: documentIds },
          },
          select: {
            name: true,
          },
        });

        context = 'Relevant documents:\n' + documents.map((d) => `- ${d.name}`).join('\n');
      }

      const systemPrompt = `Sen bir hukuk araştırma asistanısın. Sağlanan sorgu ve bağlama dayanarak hukuk araştırmasında yardımcı ol. Her zaman Türkçe dilinde cevap vermelisin.`;

      const userPrompt = context ? `Context:\n${context}\n\nQuery: ${query}` : `Query: ${query}`;

      const completion = await openai.chat.completions.create({
        model: aiConfig?.model || this.configService.get<string>('OPENAI_MODEL') || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: (aiConfig?.settings as any)?.temperature || 0.7,
        max_tokens: (aiConfig?.settings as any)?.maxTokens || 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Research error:', error);
      throw error;
    }
  }

  private async buildSystemPrompt(context?: any): Promise<string> {
    let prompt = 'Sen LexMind AI, bir hukuk uygulama yönetim sistemi için yardımcı bir yapay zeka asistanısın. Her zaman Türkçe dilinde cevap vermelisin.';

    if (context) {
      if (context.caseId) {
        const caseData = await this.prisma.case.findUnique({
          where: { id: context.caseId },
          select: { title: true, type: true, description: true },
        });
        if (caseData) {
          prompt += `\nMevcut dava: ${caseData.title} (${caseData.type})\nAçıklama: ${caseData.description || ''}`;
        }
      }

      if (context.clientId) {
        const clientData = await this.prisma.client.findUnique({
          where: { id: context.clientId },
          select: { firstName: true, lastName: true, notes: true },
        });
        if (clientData) {
          prompt += `\nMüvekkil: ${clientData.firstName} ${clientData.lastName}\nNotlar: ${clientData.notes || ''}`;
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

  private async logUsage(service: string, usage: any, responseTime: number, userId?: string) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId: userId || 'system',
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

  private async getUserAIConfig(userId?: string) {
    if (!userId) return null;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          aiProvider: true,
          aiApiKey: true,
          aiModel: true,
          aiSettings: true,
        },
      });

      if (!user || !user.aiApiKey) return null;

      const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-encryption-key';
      
      let decryptedApiKey = null;
      try {
        decryptedApiKey = EncryptionUtil.decrypt(user.aiApiKey, encryptionKey);
      } catch (error) {
        this.logger.error('Failed to decrypt API key:', error);
        return null;
      }

      return {
        provider: user.aiProvider,
        apiKey: decryptedApiKey,
        model: user.aiModel,
        settings: user.aiSettings,
      };
    } catch (error) {
      this.logger.error('Failed to get user AI config:', error);
      return null;
    }
  }

  private getOpenAIClient(aiConfig: any): OpenAI {
    if (aiConfig?.apiKey) {
      const config: any = { apiKey: aiConfig.apiKey };
      
      // Set base URL for OpenRouter
      if (aiConfig.provider === 'openrouter') {
        config.baseURL = 'https://openrouter.ai/api/v1';
      }
      
      return new OpenAI(config);
    }
    
    // Fallback to default configuration
    const defaultApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (defaultApiKey) {
      return new OpenAI({ apiKey: defaultApiKey });
    }

    throw new Error('No AI API key configured');
  }
}
