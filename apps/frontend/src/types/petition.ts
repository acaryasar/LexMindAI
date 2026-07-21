// Petition Types for LexMind AI

export type PetitionType = 
  | 'CEVAP_DILEKCESI'
  | 'ISTINAF_DILEKCESI'
  | 'TEMYIZ_DILEKCESI'
  | 'ICRA_DILEKCESI'
  | 'CEZA_DILEKCESI'
  | 'IS_HUKUKU_DILEKCESI'
  | 'BOSANMA_DILEKCESI'
  | 'TICARET_DILEKCESI'
  | 'TAZMINAT_DILEKCESI'
  | 'IHTIATI_TEDBIR_DILEKCESI'
  | 'AYM_DILEKCESI'
  | 'AIHM_DILEKCESI'
  | 'OFIS_DILEKCESI'
  | 'UYAP_DILEKCESI'
  | 'DIGER';

export type PetitionStatus = 
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'REJECTED'
  | 'ARCHIVED';

export type PetitionPriority = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type FileType = 'PDF' | 'WORD' | 'UYAP';

export interface PetitionParty {
  id: string;
  name: string;
  type: 'PLAINTIFF' | 'DEFENDANT' | 'THIRD_PARTY';
  role: string;
  lawyer?: string;
}

export interface PetitionEvidence {
  id: string;
  type: string;
  description: string;
  date?: string;
  fileUrl?: string;
}

export interface PetitionClaim {
  id: string;
  description: string;
  amount?: number;
  currency?: string;
  legalBasis?: string;
}

export interface PetitionVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string;
  fileUrl: string;
}

export interface PetitionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Petition {
  id: string;
  name: string;
  type: PetitionType;
  status: PetitionStatus;
  priority: PetitionPriority;
  
  // Case Information
  caseId?: string;
  caseNumber?: string;
  courtName: string;
  judge?: string;
  department?: string;
  essenceNo?: string;
  decisionNo?: string;
  
  // Client Information
  clientId?: string;
  clientName?: string;
  
  // Content
  subject: string;
  content: string;
  
  // Parties
  parties: PetitionParty[];
  
  // Evidence
  evidence: PetitionEvidence[];
  
  // Claims
  claims: PetitionClaim[];
  
  // Metadata
  preparedBy: string;
  preparedAt: string;
  updatedAt: string;
  dueDate?: string;
  
  // Versioning
  currentVersion: string;
  versions: PetitionVersion[];
  
  // Attachments
  attachments: PetitionAttachment[];
  
  // AI
  isAIGenerated: boolean;
  aiSuggestions?: string[];
  aiRiskAnalysis?: string;
  
  // Tags
  tags: string[];
  
  // Electronic Signature
  isElectronicallySigned: boolean;
  signedAt?: string;
  signedBy?: string;
  
  // UYAP
  isUYAPSubmitted: boolean;
  uyapSubmittedAt?: string;
  uyapReference?: string;
  
  // Export
  exportFormats: FileType[];
}

export interface PetitionFilter {
  caseId?: string;
  clientId?: string;
  courtName?: string;
  type?: PetitionType;
  preparedBy?: string;
  tags?: string[];
  status?: PetitionStatus;
  priority?: PetitionPriority;
  version?: string;
  isAIGenerated?: boolean;
  isElectronicallySigned?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface PetitionKPI {
  total: number;
  draft: number;
  inReview: number;
  completed: number;
  todayCreated: number;
  awaitingSignature: number;
  awaitingUYAP: number;
  aiGenerated: number;
  trend: {
    total: number;
    draft: number;
    inReview: number;
    completed: number;
    aiGenerated: number;
  };
}

export interface PetitionTemplate {
  id: string;
  name: string;
  type: PetitionType;
  category: string;
  content: string;
  placeholders: string[];
  isSystemTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIPetitionSuggestion {
  id: string;
  type: 'LEGAL_BASIS' | 'PRECEDENT' | 'EVIDENCE' | 'LANGUAGE' | 'RISK' | 'STRUCTURE';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface AIPetitionAnalysis {
  suggestions: AIPetitionSuggestion[];
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
