import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class VoiceAgent extends BaseAgent {
  readonly agentType = 'voice';
  readonly purpose = 'Process voice communications and transcriptions';
  readonly responsibilities = [
    'Transcribe voice recordings',
    'Summarize voice notes',
    'Extract action items',
    'Identify speakers',
    'Generate voice commands',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(configService: ConfigService) {
    super(configService, 'VoiceAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Voice Agent for LexMind AI, a legal practice management system.
    Your task is to process voice communications and transcriptions.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Process voice recording: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "transcription": "Full transcription",
  "summary": "Summary of the voice recording",
  "speakers": [
    { "speaker": "Speaker 1", "segments": ["Segment 1", "Segment 2"] }
  ],
  "actionItems": [
    { "item": "Action item", "dueDate": "ISO date", "responsible": "Person" }
  ],
  "keyPoints": ["Key point 1", "Key point 2"],
  "decisions": ["Decision 1", "Decision 2"],
  "followUpRequired": true,
  "confidence": 0.95,
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
        transcription: 'Unable to parse AI response',
        summary: 'Unable to parse AI response',
        speakers: [],
        actionItems: [],
        keyPoints: [],
        decisions: [],
        followUpRequired: false,
        confidence: 0,
        reasons: [],
        sources: [],
        recommendations: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && (input.audioData || input.transcript);
  }
}
