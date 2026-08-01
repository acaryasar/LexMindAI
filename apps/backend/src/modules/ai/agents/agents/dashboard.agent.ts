import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class DashboardAgent extends BaseAgent {
  readonly agentType = 'dashboard';
  readonly purpose = 'Generate daily briefing and insights for lawyers';
  readonly responsibilities = [
    'Generate morning briefing',
    'Generate daily summary',
    'Generate priority list',
    'Generate risk analysis',
    'Generate time-saving suggestions',
    'Generate AI insights',
    'Generate notifications',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'DashboardAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Dashboard Agent'sın, bir hukuk uygulama yönetim sistemi. 
    Görevin avukatlar için kapsamlı günlük brifingler ve içgörüler sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Aşağıdaki bağlama dayanarak günlük bir brifing oluştur: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "morningBriefing": "Günün özeti",
  "dailySummary": "Faaliyetlerin özeti",
  "priorityList": [
    { "task": "Görev açıklaması", "urgency": "high|medium|low", "deadline": "ISO tarih" }
  ],
  "riskAnalysis": [
    { "risk": "Risk açıklaması", "impact": "high|medium|low", "mitigation": "Azaltma stratejisi" }
  ],
  "timeSavingSuggestions": ["Öneri 1", "Öneri 2"],
  "aiInsights": ["İçgörü 1", "İçgörü 2"],
  "notifications": [
    { "type": "deadline|hearing|task", "message": "Bildirim mesajı", "action": "Önerilen eylem" }
  ],
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
        morningBriefing: 'Unable to parse AI response',
        dailySummary: 'Unable to parse AI response',
        priorityList: [],
        riskAnalysis: [],
        timeSavingSuggestions: [],
        aiInsights: [],
        notifications: [],
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
