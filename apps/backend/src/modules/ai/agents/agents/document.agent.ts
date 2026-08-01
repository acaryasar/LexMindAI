import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class DocumentAgent extends BaseAgent {
  readonly agentType = 'document';
  readonly purpose = 'Analyze legal documents and extract key information';
  readonly responsibilities = [
    'Summarize documents',
    'Extract entities (dates, persons, companies, courts, laws, obligations)',
    'Perform risk analysis',
    'Identify key findings',
    'Provide recommendations',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.15;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'DocumentAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Document Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin hukuk belgelerini analiz etmek ve önemli bilgileri çıkarmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Aşağıdaki belgeyi analiz et: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "summary": "Belge özeti",
  "entities": {
    "dates": ["Tarih 1", "Tarih 2"],
    "persons": ["Kişi 1", "Kişi 2"],
    "companies": ["Şirket 1", "Şirket 2"],
    "courts": ["Mahkeme 1", "Mahkeme 2"],
    "laws": ["Kanun 1", "Kanun 2"],
    "obligations": ["Yükümlülük 1", "Yükümlülük 2"]
  },
  "riskAnalysis": [
    { "risk": "Risk açıklaması", "severity": "high|medium|low", "mitigation": "Azaltma stratejisi" }
  ],
  "keyFindings": ["Bulgu 1", "Bulgu 2"],
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
        summary: 'Unable to parse AI response',
        entities: { dates: [], persons: [], companies: [], courts: [], laws: [], obligations: [] },
        riskAnalysis: [],
        keyFindings: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.documentId || input.documentContent);
  }
}
