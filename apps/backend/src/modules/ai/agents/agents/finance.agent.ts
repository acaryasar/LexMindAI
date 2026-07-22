import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(configService: ConfigService) {
    super(configService, 'FinanceAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Finance Agent for LexMind AI, a legal practice management system.
    Your task is to analyze financial data and provide insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the financial data: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "financialSummary": "Summary of financial status",
  "overdueInvoices": [
    { "invoiceNumber": "Invoice number", "client": "Client name", "amount": "Amount", "daysOverdue": "Days", "action": "Suggested action" }
  ],
  "revenueForecast": {
    "currentMonth": "Amount",
    "nextMonth": "Amount",
    "quarter": "Amount",
    "trend": "increasing|stable|decreasing"
  },
  "cashFlowAnalysis": {
    "status": "healthy|warning|critical",
    "factors": ["Factor 1", "Factor 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "billingSuggestions": ["Suggestion 1", "Suggestion 2"],
  "reasons": ["Reason 1", "Reason 2"],
  "sources": ["Source 1", "Source 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "actions": [
    { "type": "action_type", "label": "Action label", "description": "Action description", "requiresApproval": false }
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
