import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class FinanceAgent extends BaseAgent {
  readonly agentType = 'finance';
  readonly purpose = 'Analyze financial data and provide insights';
  readonly responsibilities = [
    'Analyze invoices',
    'Track payments',
    'Forecast revenue',
    'Identify overdue payments',
    'Suggest billing strategies',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.15;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'FinanceAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Finance Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin finansal verileri analiz etmek ve içgörüler sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Finansal verileri analiz et: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "financialSummary": "Finansal durum özeti",
  "overdueInvoices": [
    { "invoiceNumber": "Fatura numarası", "client": "Müvekkil adı", "amount": "Tutar", "daysOverdue": "Gün", "action": "Önerilen eylem" }
  ],
  "revenueForecast": {
    "currentMonth": "Tutar",
    "nextMonth": "Tutar",
    "quarter": "Tutar",
    "trend": "increasing|stable|decreasing"
  },
  "cashFlowAnalysis": {
    "status": "healthy|warning|critical",
    "factors": ["Faktör 1", "Faktör 2"],
    "recommendations": ["Öneri 1", "Öneri 2"]
  },
  "billingSuggestions": ["Öneri 1", "Öneri 2"],
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
        financialSummary: 'Unable to parse AI response',
        overdueInvoices: [],
        revenueForecast: { currentMonth: 0, nextMonth: 0, quarter: 0, trend: 'unknown' },
        cashFlowAnalysis: { status: 'unknown', factors: [], recommendations: [] },
        billingSuggestions: [],
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
