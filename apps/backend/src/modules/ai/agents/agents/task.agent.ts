import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from '../../providers/provider-factory.service';
import { BaseAgent } from '../base-agent.service';
import { AgentExecutionContext, AgentExecutionResult } from '../interfaces/agent.interface';

@Injectable()
export class TaskAgent extends BaseAgent {
  readonly agentType = 'task';
  readonly purpose = 'Manage tasks and provide productivity insights';
  readonly responsibilities = [
    'Prioritize tasks',
    'Estimate effort',
    'Suggest task breakdown',
    'Track progress',
    'Identify bottlenecks',
  ];
  readonly confidence = 0.85;
  readonly riskScore = 0.1;

  constructor(
    configService: ConfigService,
    aiProviderFactory: AIProviderFactory,
  ) {
    super(configService, aiProviderFactory, 'TaskAgent');
  }

  protected getSystemPrompt(): string {
    return `Sen LexMind AI için bir Task Agent'sın, bir hukuk uygulama yönetim sistemi.
    Görevin görevleri yönetmek ve verimlilik içgörüleri sağlamak.
    Her zaman Türkçe dilinde ve geçerli JSON formatında cevap vermelisin.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Görevleri analiz et: ${contextStr}`;
    
    return `${prompt}

Lütfen aşağıdaki bilgileri JSON formatında sağla:
{
  "taskAnalysis": "Genel görev analizi",
  "prioritizedTasks": [
    { "taskId": "task_id", "title": "Görev başlığı", "priority": "high|medium|low", "estimatedEffort": "saat", "suggestedOrder": 1 }
  ],
  "bottlenecks": [
    { "bottleneck": "Darboğaz açıklaması", "impact": "high|medium|low", "solution": "Çözüm önerisi" }
  ],
  "breakdownSuggestions": [
    { "task": "Görev adı", "subtasks": ["Alt görev 1", "Alt görev 2"], "estimatedTime": "saat" }
  ],
  "productivityTips": ["İpucu 1", "İpucu 2"],
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
        taskAnalysis: 'Unable to parse AI response',
        prioritizedTasks: [],
        bottlenecks: [],
        breakdownSuggestions: [],
        productivityTips: [],
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
