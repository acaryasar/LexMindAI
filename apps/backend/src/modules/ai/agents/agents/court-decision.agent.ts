import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class CourtDecisionAgent extends BaseAgent {
  readonly agentType = 'court-decision';
  readonly purpose = 'Analyze court decisions and provide insights';
  readonly responsibilities = [
    'Analyze court decisions',
    'Extract key holdings',
    'Identify precedents',
    'Summarize judgments',
    'Compare decisions',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.2;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'CourtDecisionAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Court Decision Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin mahkeme kararlarını analiz etmek ve içgörüler sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Mahkeme kararını analiz et: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "decisionSummary": "Mahkeme kararının özeti",
  "keyHoldings": [
    { "holding": "Ana karar", "importance": "high|medium|low", "implication": "Etki" }
  ],
  "precedentValue": {
    "isPrecedent": true,
    "scope": "narrow|broad",
    "jurisdiction": "Yargı yetkisi",
    "applicability": "Uygulanabilirlik"
  },
  "similarCases": [
    { "caseName": "Dava adı", "similarity": "high|medium|low", "difference": "Temel fark" }
  ],
  "legalPrinciples": ["İlke 1", "İlke 2"],
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
        decisionSummary: 'Unable to parse AI response',
        keyHoldings: [],
        precedentValue: { isPrecedent: false, scope: 'unknown', jurisdiction: 'unknown', applicability: 'unknown' },
        similarCases: [],
        legalPrinciples: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.decisionText || input.caseNumber);
  }
}
