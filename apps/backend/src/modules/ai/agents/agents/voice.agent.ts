import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
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

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'VoiceAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Voice Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin ses iletişimlerini ve transkripsiyonları işlemek.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Ses kaydını işle: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "transcription": "Tam transkripsiyon",
  "summary": "Ses kaydının özeti",
  "speakers": [
    { "speaker": "Konuşmacı 1", "segments": ["Bölüm 1", "Bölüm 2"] }
  ],
  "actionItems": [
    { "item": "Eylem öğesi", "dueDate": "ISO tarih", "responsible": "Kişi" }
  ],
  "keyPoints": ["Ana nokta 1", "Ana nokta 2"],
  "decisions": ["Karar 1", "Karar 2"],
  "followUpRequired": true,
  "confidence": 0.95,
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
