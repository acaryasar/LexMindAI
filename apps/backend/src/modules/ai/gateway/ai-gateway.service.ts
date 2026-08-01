import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { PrismaService } from '@database/prisma.service';
import { EncryptionUtil } from '@common/encryption.util';
import { AIProviderFactory } from '../providers/provider-factory.service';
import { AIContextService } from '../services/ai-context.service';
import { RolePromptService } from '../services/role-prompt.service';
import { AI_TOOLS } from '../tools/ai-tools-definitions';

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private openai: OpenAI | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private aiProviderFactory: AIProviderFactory,
    private aiContextService: AIContextService,
    private rolePromptService: RolePromptService,
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
      this.logger.log(`[AIGateway] Chat called - userId: ${userId}, message: "${message.substring(0, 50)}..."`);

      // Get user-specific AI configuration
      aiConfig = await this.getUserAIConfig(userId);

      // Determine provider to use
      const providerName = aiConfig?.provider || this.configService.get<string>('DEFAULT_AI_PROVIDER', 'ollama');

      // Build system prompt with user context
      let systemPrompt = await this.buildSystemPrompt(context, userId);
      this.logger.log(`[AIGateway] System prompt built, length: ${systemPrompt.length}`);

      // Check if message requires tool execution
      const toolResult = await this.executeToolIfNeeded(message, userId || '', conversationId);
      this.logger.log(`[AIGateway] Tool result: ${JSON.stringify(toolResult)}`);
      
      if (toolResult) {
        // Tool sonucunu daha anlaşılır formatta ekle
        let toolResultText = '';
        if (toolResult.message) {
          toolResultText = toolResult.message;
        } else if (toolResult.count !== undefined) {
          toolResultText = `Müvekkil Sayısı: ${toolResult.count}`;
        } else if (toolResult.clientCount !== undefined) {
          toolResultText = `Müvekkil Sayısı: ${toolResult.clientCount}`;
          if (toolResult.caseCount !== undefined) {
            toolResultText += `\nDava Sayısı: ${toolResult.caseCount}`;
          }
          if (toolResult.activeCaseCount !== undefined) {
            toolResultText += `\nAktif Dava Sayısı: ${toolResult.activeCaseCount}`;
          }
        } else if (toolResult.tasks !== undefined) {
          toolResultText = `Görev Sayısı: ${toolResult.count}`;
        }
        
        if (toolResultText) {
          systemPrompt += `\n\nSistem Bilgisi:\n${toolResultText}`;
          this.logger.log(`[AIGateway] Tool result added to system prompt: ${toolResultText}`);
        } else {
          systemPrompt += `\n\nEk Bilgiler:\n${JSON.stringify(toolResult, null, 2)}`;
        }
      } else {
        this.logger.log(`[AIGateway] No tool result for message`);
      }

      // Get conversation history if conversationId provided
      const messages = await this.buildMessages(message, conversationId, systemPrompt);
      this.logger.log(`[AIGateway] Messages built, count: ${messages.length}`);

      // Use AIProviderFactory for chat
      const response = await this.aiProviderFactory.chat(messages, {
        model: aiConfig?.model || this.configService.get<string>('OLLAMA_MODEL', 'mistral:latest'),
        temperature: (aiConfig?.settings as any)?.temperature || 0.7,
        maxTokens: (aiConfig?.settings as any)?.maxTokens || 2000,
      }, providerName);

      const responseTime = Date.now() - startTime;
      this.logger.log(`[AIGateway] AI response received, length: ${response.content?.length || 0}`);

      // Log usage
      await this.logUsage('chat', response.usage, responseTime, userId);

      return {
        response: response.content,
        usage: response.usage,
      };
    } catch (error: any) {
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

  private async executeToolIfNeeded(message: string, userId: string, conversationId?: string): Promise<any> {
    if (!userId) {
      this.logger.warn('No userId provided for tool execution');
      return null;
    }

    const lowerMessage = message.toLowerCase();
    this.logger.log(`Checking tool execution for message: "${message}" (userId: ${userId})`);

    // Önce conversation history'den isim çıkarma (mesajda isim belirtilmemişse)
    let lawyerNameFromHistory = null;
    if (conversationId && (lowerMessage.includes('müvekkil') || lowerMessage.includes('dava'))) {
      const messages = await this.prisma.aIMessage.findMany({
        where: { 
          conversationId,
          role: 'user', // Sadece kullanıcı mesajlarından isim çıkarma
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      
      // Son kullanıcı mesajlarından isim çıkarma
      for (const msg of messages) {
        const nameMatch = msg.content.match(/(?:avukat\s+)?([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)?)/);
        if (nameMatch && nameMatch[1] && nameMatch[1].length > 2) {
          const potentialName = nameMatch[1];
          // Admin, User, System gibi kelimeleri isim olarak kabul etme
          const excludedWords = ['Admin', 'User', 'System', 'LexMind', 'AI', 'Assistant'];
          if (!excludedWords.some(word => potentialName.includes(word))) {
            lawyerNameFromHistory = potentialName;
            this.logger.log(`Found lawyer name from user history: ${lawyerNameFromHistory}`);
            break;
          }
        }
      }
    }

    // İsim bazlı avukat sorgusu (örn: "Avukat Yaşar Acar'ın kaç müvekkili var?")
    const lawyerNameMatch = lowerMessage.match(/(?:avukat\s+)?([a-zçğıöşü\s]{3,})(?:'?ın|'?in)?\s*(?:kaç|müvekkil|dava)/i);
    if (lawyerNameMatch && lawyerNameMatch[1]) {
      const lawyerName = lawyerNameMatch[1].trim();
      // "kaç", "ne", "kim" gibi kelimeleri isim olarak kabul etme
      if (!['kaç', 'ne', 'kim', 'hangi', 'nasıl', 'neden'].includes(lawyerName.toLowerCase())) {
        this.logger.log(`Executing get_lawyer_stats_by_name tool for: ${lawyerName}`);
        return await this.executeTool('get_lawyer_stats_by_name', { lawyerName }, userId);
      }
    }

    // Conversation history'den isim bulunduysa ve mesajda müvekkil/dava sorusu varsa
    if (lawyerNameFromHistory && (lowerMessage.includes('müvekkil') || lowerMessage.includes('dava'))) {
      this.logger.log(`Using lawyer name from history: ${lawyerNameFromHistory}`);
      return await this.executeTool('get_lawyer_stats_by_name', { lawyerName: lawyerNameFromHistory }, userId);
    }

    // "kaç aktif ve toplam davası var?" gibi sorular için
    if ((lowerMessage.includes('dava') && (lowerMessage.includes('kaç') || lowerMessage.includes('sayı'))) || 
        lowerMessage.includes('aktif') || lowerMessage.includes('toplam')) {
      
      if (lawyerNameFromHistory) {
        this.logger.log(`Using lawyer name from history for stats: ${lawyerNameFromHistory}`);
        return await this.executeTool('get_lawyer_stats_by_name', { lawyerName: lawyerNameFromHistory }, userId);
      } else {
        this.logger.log('Executing get_lawyer_stats tool for current user');
        return await this.executeTool('get_lawyer_stats', {}, userId);
      }
    }

    // Simple keyword-based tool detection
    if (lowerMessage.includes('müvekkil') && (lowerMessage.includes('kaç') || lowerMessage.includes('sayı') || lowerMessage.includes('adet'))) {
      if (lawyerNameFromHistory) {
        this.logger.log(`Using lawyer name from history for client count: ${lawyerNameFromHistory}`);
        return await this.executeTool('get_lawyer_stats_by_name', { lawyerName: lawyerNameFromHistory }, userId);
      } else {
        this.logger.log('Executing get_client_count tool');
        return await this.executeTool('get_client_count', {}, userId);
      }
    }
    if (lowerMessage.includes('istatistik') || lowerMessage.includes('kaç müvekkil') || lowerMessage.includes('kaç dava')) {
      this.logger.log('Executing get_lawyer_stats tool');
      return await this.executeTool('get_lawyer_stats', {}, userId);
    }
    if (lowerMessage.includes('son teslim') || lowerMessage.includes('deadline') || lowerMessage.includes('görev')) {
      this.logger.log('Executing get_upcoming_deadlines tool');
      return await this.executeTool('get_upcoming_deadlines', {}, userId);
    }
    if (lowerMessage.includes('bugün') && lowerMessage.includes('görev')) {
      this.logger.log('Executing get_today_tasks tool');
      return await this.executeTool('get_today_tasks', {}, userId);
    }

    this.logger.log('No tool matched for message');
    return null;
  }

  private async executeTool(toolName: string, params: any, userId: string): Promise<any> {
    const tool = AI_TOOLS.find(t => t.name === toolName);
    if (!tool) {
      this.logger.warn(`Tool not found: ${toolName}`);
      return null;
    }

    try {
      this.logger.log(`Executing tool ${toolName} for userId: ${userId}`);
      const result = await tool.handler(params, userId, this.prisma);
      this.logger.log(`Tool ${toolName} executed successfully:`, result);
      return result;
    } catch (error: any) {
      this.logger.error(`Tool execution error (${toolName}):`, error);
      return null;
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

  private async buildSystemPrompt(context?: any, userId?: string): Promise<string> {
    let prompt = 'Sen LexMind AI, bir hukuk uygulama yönetim sistemi için yardımcı bir yapay zeka asistanısın. Her zaman Türkçe dilinde cevap vermelisin.';

    // Add role-specific prompt if userId is provided
    if (userId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (user && user.roles && user.roles.length > 0) {
          const primaryRoleName = user.roles[0].role.name; // Rol adını al
          const rolePrompt = this.rolePromptService.getRolePrompt(primaryRoleName);
          if (rolePrompt) {
            prompt = rolePrompt;
          }
        }
      } catch (error) {
        this.logger.warn('Failed to get user role:', error);
      }
    }

    // Add user profile context if userId is provided
    if (userId) {
      try {
        const userContext = await this.aiContextService.getContextSummary(userId);
        if (userContext) {
          prompt += `\n\n${userContext}`;
        }
      } catch (error) {
        this.logger.warn('Failed to get user context:', error);
      }
    }

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
