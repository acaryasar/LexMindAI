import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(configService: ConfigService) {
    super(configService, 'StrategyAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Strategy Agent for LexMind AI, a legal practice management system.
    Your task is to develop and analyze legal strategies.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Develop legal strategy: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "strategyAnalysis": "Overall strategy analysis",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "recommendedStrategy": {
    "primaryApproach": "Primary approach description",
    "backupPlan": "Backup plan description",
    "keyArguments": ["Argument 1", "Argument 2"],
    "evidenceFocus": ["Evidence 1", "Evidence 2"]
  },
  "settlementAnalysis": {
    "recommended": true,
    "estimatedValue": "Estimated value",
    "probability": "Probability percentage",
    "reasoning": "Reasoning"
  },
  "nextSteps": ["Step 1", "Step 2"],
  "reasons": ["Reason 1", "Reason 2"],
  "sources": ["Source 1", "Source 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "actions": [
    { "type": "action_type", "label": "Action label", "description": "Action description", "requiresApproval": true }
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
