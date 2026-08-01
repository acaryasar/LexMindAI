import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class HearingAgent extends BaseAgent {
  readonly agentType = 'hearing';
  readonly purpose = 'Prepare for court hearings and generate preparation materials';
  readonly responsibilities = [
    'Generate hearing preparation checklist',
    'Generate judge summary',
    'Generate case timeline',
    'Summarize evidence',
    'Predict potential questions',
    'Identify counter-arguments',
    'Create preparation notes',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.25;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'HearingAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Hearing Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin mahkeme duruşmalarına hazırlanmak ve hazırlık materyalleri oluşturmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Aşağıdaki duruşmaya hazırlan: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "preparationChecklist": [
    { "item": "Kontrol listesi öğesi", "completed": false, "priority": "high|medium|low" }
  ],
  "judgeSummary": {
    "name": "Hakim adı",
    "background": "Hakim geçmişi",
    "preferences": ["Tercih 1", "Tercih 2"]
  },
  "caseTimeline": [
    { "date": "ISO tarih", "event": "Etkinlik açıklaması", "significance": "high|medium|low" }
  ],
  "evidenceSummary": [
    { "evidence": "Delil açıklaması", "relevance": "high|medium|low", "notes": "Notlar" }
  ],
  "potentialQuestions": [
    { "question": "Soru", "category": "kategori", "suggestedAnswer": "Önerilen cevap" }
  ],
  "counterArguments": [
    { "argument": "Karşı argüman", "strength": "strong|medium|weak", "rebuttal": "Çürütmeye stratejisi" }
  ],
  "preparationNotes": "Ek hazırlık notları",
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
        preparationChecklist: [],
        judgeSummary: { name: 'Unknown', background: 'Unable to parse', preferences: [] },
        caseTimeline: [],
        evidenceSummary: [],
        potentialQuestions: [],
        counterArguments: [],
        preparationNotes: 'Unable to parse AI response',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.hearingId || input.caseId);
  }
}
