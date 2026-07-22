import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ActionDto {
  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsString()
  description: string;

  @IsBoolean()
  requiresApproval: boolean;
}

export class RiskDto {
  @IsString()
  risk: string;

  @IsString()
  severity: 'high' | 'medium' | 'low';

  @IsString()
  probability?: 'high' | 'medium' | 'low';

  @IsString()
  mitigation?: string;
}

export class DeadlineDto {
  @IsString()
  deadline: string;

  @IsString()
  date: string;

  @IsString()
  urgency: 'high' | 'medium' | 'low';
}

export class TaskDto {
  @IsString()
  task: string;

  @IsString()
  urgency: 'high' | 'medium' | 'low';

  @IsString()
  deadline?: string;
}

export class NotificationDto {
  @IsString()
  type: 'deadline' | 'hearing' | 'task' | 'document' | 'system';

  @IsString()
  message: string;

  @IsString()
  action?: string;
}

export class DashboardOutputDto {
  @IsString()
  morningBriefing: string;

  @IsString()
  dailySummary: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  priorityList: TaskDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  riskAnalysis: RiskDto[];

  @IsArray()
  @IsString()
  timeSavingSuggestions: string[];

  @IsArray()
  @IsString()
  aiInsights: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationDto)
  notifications: NotificationDto[];

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

export class CaseOutputDto {
  @IsString()
  aiSummary: string;

  @IsArray()
  @IsString()
  missingEvidence: string[];

  @IsArray()
  @IsString()
  missingDocuments: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  risks: RiskDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeadlineDto)
  deadlines: DeadlineDto[];

  @IsArray()
  @IsObject()
  similarCases: any[];

  @IsString()
  recommendedStrategy: string;

  @IsArray()
  @IsString()
  successFactors: string[];

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

export class ClientOutputDto {
  @IsString()
  relationshipSummary: string;

  @IsArray()
  @IsObject()
  pendingMatters: any[];

  @IsArray()
  @IsObject()
  communicationRecommendations: any[];

  @IsObject()
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    factors: string[];
  };

  @IsArray()
  @IsObject()
  actionItems: any[];

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

export class DocumentOutputDto {
  @IsString()
  summary: string;

  @IsObject()
  entities: {
    dates: string[];
    persons: string[];
    companies: string[];
    courts: string[];
    laws: string[];
    obligations: string[];
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskDto)
  riskAnalysis: RiskDto[];

  @IsArray()
  @IsString()
  keyFindings: string[];

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

export class HearingOutputDto {
  @IsArray()
  @IsObject()
  preparationChecklist: any[];

  @IsObject()
  judgeSummary: {
    name: string;
    background: string;
    preferences: string[];
  };

  @IsArray()
  @IsObject()
  caseTimeline: any[];

  @IsArray()
  @IsObject()
  evidenceSummary: any[];

  @IsArray()
  @IsObject()
  potentialQuestions: any[];

  @IsArray()
  @IsObject()
  counterArguments: any[];

  @IsString()
  preparationNotes: string;

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}

export class PetitionOutputDto {
  @IsString()
  documentType: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  @IsObject()
  sections: any[];

  @IsArray()
  @IsString()
  legalReferences: string[];

  @IsArray()
  @IsString()
  attachments: string[];

  @IsArray()
  @IsString()
  reasons: string[];

  @IsArray()
  @IsString()
  sources: string[];

  @IsArray()
  @IsString()
  recommendations: string[];

  @IsArray()
  @IsString()
  warnings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];
}
