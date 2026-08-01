import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class ResearchAgent extends BaseAgent {
  readonly agentType = 'research';
  readonly purpose = 'Conduct legal research and provide case law insights';
  readonly responsibilities = [
    'Search case law',
    'Find precedents',
    'Analyze legal articles',
    'Identify relevant statutes',
    'Summarize legal concepts',
  ];
  readonly confidence = 0.8;
  readonly riskScore = 0.2;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'ResearchAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Research Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin hukuk araştırmaları yapmak ve içtihat içgörüleri sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Aşağıdaki hukuk konusunu araştırmak: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "researchSummary": "Araştırma bulgularının özeti",
  "relevantCases": [
    { "caseName": "Dava adı", "year": "Yıl", "court": "Mahkeme", "relevance": "high|medium|low", "keyHolding": "Ana karar" }
  ],
  "relevantStatutes": [
    { "statute": "Kanun adı", "article": "Madde", "relevance": "high|medium|low", "keyPoint": "Ana nokta" }
  ],
  "legalArticles": [
    { "title": "Makale başlığı", "author": "Yazar", "year": "Yıl", "relevance": "high|medium|low", "summary": "Özet" }
  ],
  "legalConcepts": [
    { "concept": "Kavram adı", "definition": "Tanım", "application": "Uygulama" }
  ],
  "researchSuggestions": ["Öneri 1", "Öneri 2"],
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
        researchSummary: 'Unable to parse AI response',
        relevantCases: [],
        relevantStatutes: [],
        legalArticles: [],
        legalConcepts: [],
        researchSuggestions: [],
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.query || input.topic);
  }
}
