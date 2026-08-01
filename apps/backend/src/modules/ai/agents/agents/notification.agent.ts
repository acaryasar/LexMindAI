import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class NotificationAgent extends BaseAgent {
  readonly agentType = 'notification';
  readonly purpose = 'Generate and manage notifications';
  readonly responsibilities = [
    'Generate notifications',
    'Prioritize alerts',
    'Schedule reminders',
    'Filter noise',
    'Optimize delivery',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'NotificationAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Notification Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin bildirimleri oluşturmak ve yönetmek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Bildirimleri oluştur: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "notifications": [
    {
      "type": "deadline|hearing|task|document|system",
      "title": "Bildirim başlığı",
      "message": "Bildirim mesajı",
      "priority": "high|medium|low",
      "urgency": "immediate|today|this_week",
      "action": "Önerilen eylem",
      "requiresAction": true
    }
  ],
  "summary": "Bildirimlerin özeti",
  "totalHighPriority": 0,
  "totalMediumPriority": 0,
  "totalLowPriority": 0,
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
        notifications: [],
        summary: 'Unable to parse AI response',
        totalHighPriority: 0,
        totalMediumPriority: 0,
        totalLowPriority: 0,
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input);
  }
}
