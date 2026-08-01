import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class EmailAgent extends BaseAgent {
  readonly agentType = 'email';
  readonly purpose = 'Draft and manage email communications';
  readonly responsibilities = [
    'Draft emails',
    'Improve email tone',
    'Summarize email threads',
    'Extract action items',
    'Suggest responses',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'EmailAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Email Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin e-posta iletişimlerini hazırlamak ve yönetmek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const emailType = context.input.emailType || 'general';
    const prompt = context.prompt || `${emailType} e-postası taslağı: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "subject": "E-posta konusu",
  "body": "E-posta gövde içeriği",
  "tone": "formal|semi-formal|informal",
  "recipient": "Alıcı adı",
  "cc": ["CC alıcı 1", "CC alıcı 2"],
  "attachments": ["Ek 1", "Ek 2"],
  "priority": "high|medium|low",
  "actionItems": [
    { "item": "Eylem öğesi", "dueDate": "ISO tarih", "responsible": "Kişi" }
  ],
  "followUpNeeded": true,
  "followUpDate": "ISO tarih",
  "reasons": ["Neden 1", "Neden 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "warnings": ["Uyarı 1", "Uyarı 2"],
  "actions": [
    { "type": "action_type", "label": "Eylem etiketi", "description": "Eylem açıklaması", "requiresApproval": false }
  ]
}`;
  }

  protected parseResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', error);
      return {
        subject: 'Unable to parse AI response',
        body: 'Unable to parse AI response',
        tone: 'formal',
        recipient: '',
        cc: [],
        attachments: [],
        priority: 'medium',
        actionItems: [],
        followUpNeeded: false,
        followUpDate: null,
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.emailContent || input.emailType);
  }
}
