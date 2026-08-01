import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class StrategyAgent extends BaseAgent {
  readonly agentType = 'strategy';
  readonly purpose = 'Develop and analyze legal strategies';
  readonly responsibilities = [
    'Develop case strategies',
    'Analyze opponent strategies',
    'Identify strengths/weaknesses',
    'Suggest tactical moves',
    'Evaluate settlement options',
  ];
  readonly confidence = 0.8;
  readonly riskScore = 0.3;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'StrategyAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Strategy Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin hukuk stratejileri geliştirmek ve analiz etmek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Hukuk stratejisi geliştir: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "strategyAnalysis": "Genel strateji analizi",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "weaknesses": ["Zayıf yön 1", "Zayıf yön 2"],
  "opportunities": ["Fırsat 1", "Fırsat 2"],
  "threats": ["Tehdit 1", "Tehdit 2"],
  "recommendedStrategy": {
    "primaryApproach": "Birincil yaklaşım açıklaması",
    "backupPlan": "Yedek plan açıklaması",
    "keyArguments": ["Argüman 1", "Argüman 2"],
    "evidenceFocus": ["Delil 1", "Delil 2"]
  },
  "settlementAnalysis": {
    "recommended": true,
    "estimatedValue": "Tahmini değer",
    "probability": "Olasılık yüzdesi",
    "reasoning": "Gerekçe"
  },
  "nextSteps": ["Adım 1", "Adım 2"],
  "reasons": ["Neden 1", "Neden 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "warnings": ["Uyarı 1", "Uyarı 2"],
  "actions": [
    { "type": "action_type", "label": "Eylem etiketi", "description": "Eylem açıklaması", "requiresApproval": true }
  ]
}`;
  }

  protected parseResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', error);
      return {
        strategyAnalysis: 'Unable to parse AI response',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
        recommendedStrategy: { primaryApproach: '', backupPlan: '', keyArguments: [], evidenceFocus: [] },
        settlementAnalysis: { recommended: false, estimatedValue: 0, probability: 0, reasoning: '' },
        nextSteps: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.caseId || input.caseContext);
  }
}
