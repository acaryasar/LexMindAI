import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class MeetingAgent extends BaseAgent {
  readonly agentType = 'meeting';
  readonly purpose = 'Prepare for and manage meetings';
  readonly responsibilities = [
    'Prepare meeting agendas',
    'Generate meeting summaries',
    'Extract action items',
    'Schedule follow-ups',
    'Document decisions',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'MeetingAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Meeting Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin toplantılara hazırlanmak ve toplantıları yönetmek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Toplantı hazırla: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "meetingAgenda": [
    { "topic": "Konu", "duration": "dakika", "priority": "high|medium|low", "presenter": "Sunan" }
  ],
  "preparationChecklist": [
    { "item": "Kontrol listesi öğesi", "completed": false, "responsible": "Kişi" }
  ],
  "keyDocuments": ["Belge 1", "Belge 2"],
  "participants": [
    { "name": "İsim", "role": "Rol", "expectedContribution": "Katkı" }
  ],
  "meetingNotes": "Toplantı notları şablonu",
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
        meetingAgenda: [],
        preparationChecklist: [],
        keyDocuments: [],
        participants: [],
        meetingNotes: 'Unable to parse AI response',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.meetingId || input.meetingType);
  }
}
