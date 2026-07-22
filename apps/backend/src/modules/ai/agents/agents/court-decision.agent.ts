import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(configService: ConfigService) {
    super(configService, 'CourtDecisionAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Court Decision Agent for LexMind AI, a legal practice management system.
    Your task is to analyze court decisions and provide insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the court decision: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "decisionSummary": "Summary of the court decision",
  "keyHoldings": [
    { "holding": "Key holding", "importance": "high|medium|low", "implication": "Implication" }
  ],
  "precedentValue": {
    "isPrecedent": true,
    "scope": "narrow|broad",
    "jurisdiction": "Jurisdiction",
    "applicability": "Applicability"
  },
  "similarCases": [
    { "caseName": "Case name", "similarity": "high|medium|low", "difference": "Key difference" }
  ],
  "legalPrinciples": ["Principle 1", "Principle 2"],
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
