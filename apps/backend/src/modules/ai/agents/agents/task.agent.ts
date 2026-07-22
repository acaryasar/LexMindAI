import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(configService: ConfigService) {
    super(configService, 'TaskAgent');
  }

  protected getSystemPrompt(): string {
    return `You are a Task Agent for LexMind AI, a legal practice management system.
    Your task is to manage tasks and provide productivity insights.
    Always return your response in valid JSON format.`;
  }

  protected buildPrompt(context: AgentExecutionContext): string {
    const contextStr = this.formatContext(context.context);
    const prompt = context.prompt || `Analyze the tasks: ${contextStr}`;
    
    return `${prompt}

Please provide the following in JSON format:
{
  "taskAnalysis": "Overall task analysis",
  "prioritizedTasks": [
    { "taskId": "task_id", "title": "Task title", "priority": "high|medium|low", "estimatedEffort": "hours", "suggestedOrder": 1 }
  ],
  "bottlenecks": [
    { "bottleneck": "Bottleneck description", "impact": "high|medium|low", "solution": "Solution suggestion" }
  ],
  "breakdownSuggestions": [
    { "task": "Task name", "subtasks": ["Subtask 1", "Subtask 2"], "estimatedTime": "hours" }
  ],
  "productivityTips": ["Tip 1", "Tip 2"],
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
