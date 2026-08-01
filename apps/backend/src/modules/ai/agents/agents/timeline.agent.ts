import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class TimelineAgent extends BaseAgent {
  readonly agentType = 'timeline';
  readonly purpose = 'Generate case timelines and chronologies';
  readonly responsibilities = [
    'Generate timelines',
    'Track milestones',
    'Identify dependencies',
    'Visualize progress',
    'Predict completion',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.15;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'TimelineAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Timeline Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin dava zaman çizelgeleri ve kronolojiler oluşturmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Zaman çizelgesi oluştur: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "timeline": [
    {
      "date": "ISO tarih",
      "event": "Etkinlik açıklaması",
      "type": "milestone|deadline|hearing|filing|other",
      "status": "completed|pending|overdue",
      "importance": "high|medium|low",
      "dependencies": ["bağımlılık1", "bağımlılık2"]
    }
  ],
  "milestones": [
    { "milestone": "Dönüm noktası adı", "date": "ISO tarih", "status": "completed|pending" }
  ],
  "criticalPath": ["etkinlik1", "etkinlik2", "etkinlik3"],
  "estimatedCompletion": "ISO tarih",
  "riskFactors": ["Risk 1", "Risk 2"],
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
        timeline: [],
        milestones: [],
        criticalPath: [],
        estimatedCompletion: null,
        riskFactors: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.caseId || input.events);
  }
}
