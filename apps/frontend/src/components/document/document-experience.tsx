'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Sparkles, AlertTriangle, CheckCircle, Clock, 
  Download, Share, ExternalLink, BookOpen, Scale, 
  ChevronDown, ChevronUp, Copy, Eye, User
} from 'lucide-react';
import { spacing, borderRadius, typography, getRiskColor } from '@/lib/design-system';

export interface ReferencedLaw {
  id: string;
  name: string;
  citation: string;
  relevance: number;
  year?: number;
}

export interface ReferencedCase {
  id: string;
  name: string;
  citation: string;
  outcome: string;
  relevance: number;
  year?: number;
}

export interface ReferencedDocument {
  id: string;
  name: string;
  type: string;
  relevance: number;
  date?: Date;
}

export interface RelatedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: Date;
}

export interface RelatedClient {
  id: string;
  name: string;
  relationship: string;
}

export interface DocumentExperienceProps {
  // Document Info
  title: string;
  type: string;
  size: string;
  uploadDate: Date;
  url: string;

  // AI Analysis
  aiSummary?: string;
  aiInsights?: Array<{
    type: 'opportunity' | 'risk' | 'suggestion';
    message: string;
    confidence?: number;
  }>;

  // References
  referencedLaws?: ReferencedLaw[];
  referencedCases?: ReferencedCase[];
  referencedDocuments?: ReferencedDocument[];

  // Related Items
  relatedTasks?: RelatedTask[];
  relatedClients?: RelatedClient[];

  // Risk Indicators
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];

  // Actions
  onDownload?: () => void;
  onShare?: () => void;
  onView?: () => void;

  // Styling
  className?: string;
}

export function DocumentExperience({
  title,
  type,
  size,
  uploadDate,
  url,
  aiSummary,
  aiInsights,
  referencedLaws,
  referencedCases,
  referencedDocuments,
  relatedTasks,
  relatedClients,
  riskLevel,
  riskFactors,
  onDownload,
  onShare,
  onView,
  className,
}: DocumentExperienceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Document Icon */}
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
                {title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {type}
                </Badge>
                <span>{size}</span>
                <span>•</span>
                <span>{formatDate(uploadDate)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView} className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
Görüntüle
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
İndir
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare} className="flex items-center gap-2">
                <Share className="w-4 h-4" />
Paylaş
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      {riskLevel && (
        <div className={cn('px-6 py-4 border-b border-gray-100', getRiskColor(riskLevel))}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">Risk Seviyesi: {riskLevel}</span>
              </div>
              {riskFactors && riskFactors.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-2', typography.h6)}>
AI Özeti
              </h4>
              <p className={cn('text-sm text-gray-700', typography.small)}>
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && aiInsights.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className={cn('text-sm font-semibold text-gray-900 mb-3', typography.h6)}>
AI İçgörüleri
          </h4>
          <div className="space-y-2">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  insight.type === 'opportunity' && 'bg-green-50 border-green-200',
                  insight.type === 'risk' && 'bg-red-50 border-red-200',
                  insight.type === 'suggestion' && 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="flex items-start gap-2">
                  {insight.type === 'opportunity' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {insight.type === 'suggestion' && <Sparkles className="w-4 h-4 text-blue-500" />}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{insight.message}</p>
                    {insight.confidence && (
                      <span className="text-xs text-gray-500 mt-1">
                        %{insight.confidence} güven
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References Section */}
      {(referencedLaws || referencedCases || referencedDocuments) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className={cn('text-sm font-semibold text-gray-900 mb-3', typography.h6)}>
Referanslar
          </h4>

          {/* Referenced Laws */}
          {referencedLaws && referencedLaws.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('laws')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
Yasalar ({referencedLaws.length})
                  </span>
                </div>
                {expandedSection === 'laws' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'laws' && (
                <div className="mt-2 space-y-2">
                  {referencedLaws.map((law) => (
                    <div
                      key={law.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{law.name}</p>
                        <p className="text-xs text-gray-500">{law.citation}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        %{law.relevance} ilgili
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Referenced Cases */}
          {referencedCases && referencedCases.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('cases')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
Davalar ({referencedCases.length})
                  </span>
                </div>
                {expandedSection === 'cases' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'cases' && (
                <div className="mt-2 space-y-2">
                  {referencedCases.map((caseRef) => (
                    <div
                      key={caseRef.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{caseRef.name}</p>
                        <p className="text-xs text-gray-500">{caseRef.citation}</p>
                        <p className="text-xs text-gray-500 mt-1">Sonuç: {caseRef.outcome}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        %{caseRef.relevance} ilgili
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Referenced Documents */}
          {referencedDocuments && referencedDocuments.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('documents')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
Belgeler ({referencedDocuments.length})
                  </span>
                </div>
                {expandedSection === 'documents' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'documents' && (
                <div className="mt-2 space-y-2">
                  {referencedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        %{doc.relevance} ilgili
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Related Items */}
      {(relatedTasks || relatedClients) && (
        <div className="px-6 py-4">
          <h4 className={cn('text-sm font-semibold text-gray-900 mb-3', typography.h6)}>
İlgili Öğeler
          </h4>

          {/* Related Tasks */}
          {relatedTasks && relatedTasks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Görevler</span>
              </div>
              <div className="space-y-2">
                {relatedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Clients */}
          {relatedClients && relatedClients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Müşteriler</span>
              </div>
              <div className="space-y-2">
                {relatedClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <span className="text-xs text-gray-500">{client.relationship}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
