import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class CalendarAgent extends BaseAgent {
  readonly agentType = 'calendar';
  readonly purpose = 'Manage calendar events and scheduling';
  readonly responsibilities = [
    'Schedule events',
    'Detect conflicts',
    'Optimize schedule',
    'Send reminders',
    'Suggest meeting times',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.15;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'CalendarAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Calendar Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin takvim etkinliklerini yönetmek ve planlama içgörüleri sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Takvimi analiz et: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "scheduleAnalysis": "Genel takvim analizi",
  "conflicts": [
    { "event1": "Etkinlik 1", "event2": "Etkinlik 2", "time": "Çakışma zamanı", "suggestion": "Çözüm önerisi" }
  ],
  "suggestedSlots": [
    { "date": "ISO tarih", "time": "Zaman", "duration": "Süre", "reason": "Öneri nedeni" }
  ],
  "upcomingDeadlines": [
    { "deadline": "Son teslim açıklaması", "date": "ISO tarih", "urgency": "high|medium|low" }
  ],
  "optimizationSuggestions": ["Öneri 1", "Öneri 2"],
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
        scheduleAnalysis: 'Unable to parse AI response',
        conflicts: [],
        suggestedSlots: [],
        upcomingDeadlines: [],
        optimizationSuggestions: [],
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
