import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class ReportAgent extends BaseAgent {
  readonly agentType = 'report';
  readonly purpose = 'Generate comprehensive reports';
  readonly responsibilities = [
    'Generate case reports',
    'Create client reports',
    'Generate financial reports',
    'Create activity reports',
    'Summarize performance',
  ];
  readonly confidence = 0.9;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'ReportAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Report Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin kapsamlı raporlar oluşturmak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const reportType = context.input.reportType || 'general';
    const prompt = context.prompt || `${reportType} raporu oluştur: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "reportTitle": "Rapor başlığı",
  "reportType": "${reportType}",
  "summary": "Yönetici özeti",
  "sections": [
    {
      "title": "Bölüm başlığı",
      "content": "Bölüm içeriği",
      "data": {
        "key": "value"
      }
    }
  ],
  "keyFindings": ["Bulgu 1", "Bulgu 2"],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "charts": [
    {
      "type": "bar|line|pie",
      "title": "Grafik başlığı",
      "data": { "labels": [], "datasets": [] }
    }
  ],
  "generatedAt": "ISO tarih",
  "reasons": ["Neden 1", "Neden 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
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
        reportTitle: 'Unable to parse AI response',
        reportType: 'unknown',
        summary: 'Unable to parse AI response',
        sections: [],
        keyFindings: [],
        recommendations: [],
        charts: [],
        generatedAt: new Date().toISOString(),
        reasons: [],
        sources: [],
        warnings: ['Failed to parse AI response'],
        actions: [],
      };
    }
  }

  validateInput(input: any): boolean {
    return super.validateInput(input) && input.reportType;
  }
}
