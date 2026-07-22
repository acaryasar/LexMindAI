import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(configService: ConfigService) {
    super(configService, 'ResearchAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Research Agent for LexMind AI, a legal practice management system.
    Your task is to conduct legal research and provide case law insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Research the following legal topic: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "researchSummary": "Summary of research findings",
  "relevantCases": [
    { "caseName": "Case name", "year": "Year", "court": "Court", "relevance": "high|medium|low", "keyHolding": "Key holding" }
  ],
  "relevantStatutes": [
    { "statute": "Statute name", "article": "Article", "relevance": "high|medium|low", "keyPoint": "Key point" }
  ],
  "legalArticles": [
    { "title": "Article title", "author": "Author", "year": "Year", "relevance": "high|medium|low", "summary": "Summary" }
  ],
  "legalConcepts": [
    { "concept": "Concept name", "definition": "Definition", "application": "Application" }
  ],
  "researchSuggestions": ["Suggestion 1", "Suggestion 2"],
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
