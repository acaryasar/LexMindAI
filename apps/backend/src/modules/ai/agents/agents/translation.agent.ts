import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class TranslationAgent extends BaseAgent {
  readonly agentType = 'translation';
  readonly purpose = 'Translate legal documents and communications';
  readonly responsibilities = [
    'Translate documents',
    'Maintain legal terminology',
    'Preserve meaning',
    'Handle cultural nuances',
    'Translate communications',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.15;

  constructor(configService: ConfigService) {
    super(configService, 'TranslationAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Translation Agent for LexMind AI, a legal practice management system.
    Your task is to translate legal documents and communications.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const targetLanguage = context.input.targetLanguage || 'English';
    const sourceText = context.input.sourceText || '';
    const prompt = context.prompt || `Translate to ${targetLanguage}`;
    
    return `${prompt}

Source text: ${sourceText}
Target language: ${targetLanguage}

Please provide the following in JSON format:
{
  "translatedText": "Full translated text",
  "sourceLanguage": "Detected source language",
  "targetLanguage": "${targetLanguage}",
  "confidence": 0.95,
  "terminologyNotes": [
    { "term": "Legal term", "translation": "Translation", "context": "Context" }
  ],
  "culturalNotes": ["Cultural nuance 1", "Cultural nuance 2"],
  "quality": "high|medium|low",
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
        translatedText: 'Unable to parse AI response',
        sourceLanguage: 'unknown',
        targetLanguage: 'unknown',
        confidence: 0,
        terminologyNotes: [],
        culturalNotes: [],
        quality: 'unknown',
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.sourceText || input.documentId);
  }
}
