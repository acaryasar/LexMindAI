'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, AlertTriangle, TrendingUp, Clock, CheckCircle, 
  XCircle, Calendar, User, FileText, Sparkles, 
  ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { spacing, borderRadius, typography, getRiskColor, getSuccessProbabilityColor } from '@/lib/design-system';

export interface MissingEvidence {
  id: string;
  type: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  date: Date;
  type: 'filing' | 'hearing' | 'response' | 'meeting';
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface CaseExperienceProps {
  // Case Info
  caseNumber: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  type: string;
  client: string;
  assignedLawyer: string;
  startDate: Date;

  // Success Probability
  successProbability: number;
  confidenceLevel: number;

  // Risk Level
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];

  // Missing Evidence
  missingEvidence?: MissingEvidence[];

  // Upcoming Deadlines
  upcomingDeadlines?: UpcomingDeadline[];

  // AI Recommendation
  aiRecommendation?: {
    message: string;
    suggestedAction: string;
    onAction?: () => void;
  };

  // Actions
  onViewDetails?: () => void;
  onAddEvidence?: () => void;
  onUpdateStatus?: () => void;

  // Styling
  className?: string;
}

export function CaseExperience({
  caseNumber,
  title,
  status,
  type,
  client,
  assignedLawyer,
  startDate,
  successProbability,
  confidenceLevel,
  riskLevel,
  riskFactors,
  missingEvidence,
  upcomingDeadlines,
  aiRecommendation,
  onViewDetails,
  onAddEvidence,
  onUpdateStatus,
  className,
}: CaseExperienceProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Case Icon */}
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-purple-500" />
            </div>

            {/* Case Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
                  {title}
                </h3>
                <Badge className={cn('text-xs', getStatusColor(status))}>
                  {status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium">{caseNumber}</span>
                <span>•</span>
                <span>{type}</span>
                <span>•</span>
                <span>{client}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{assignedLawyer}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(startDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails}>
Detayları Gör
              </Button>
            )}
            {onAddEvidence && (
              <Button variant="outline" size="sm" onClick={onAddEvidence} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
Kanıt Ekle
              </Button>
            )}
            {onUpdateStatus && (
              <Button variant="outline" size="sm" onClick={onUpdateStatus}>
Durumu Güncelle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Probability & Risk Level */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          {/* Success Probability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Başarı Olasılığı</span>
              </div>
              <span className={cn('text-2xl font-bold', getSuccessProbabilityColor(successProbability))}>
                {successProbability}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getSuccessProbabilityColor(successProbability).replace('text-', 'bg-'))}
                style={{ width: `${successProbability}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              %{confidenceLevel} güven
            </p>
          </div>

          {/* Risk Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Risk Seviyesi</span>
              </div>
              <span className={cn('text-sm font-semibold px-2 py-1 rounded-full border', getRiskColor(riskLevel))}>
                {riskLevel}
              </span>
            </div>
            {riskFactors && riskFactors.length > 0 && (
              <div className="mt-2 space-y-1">
                {riskFactors.slice(0, 2).map ((factor, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                    <div className="w-1 h-1 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
                {riskFactors.length > 2 && (
                  <button
                    onClick={() => toggleSection('riskFactors')}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    +{riskFactors.length - 2} daha fazla
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-1', typography.h6)}>
AI Önerisi
              </h4>
              <p className={cn('text-sm text-gray-700 mb-2', typography.small)}>
                {aiRecommendation.message}
              </p>
              {aiRecommendation.onAction && (
                <Button
                  size="sm"
                  onClick={aiRecommendation.onAction}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {aiRecommendation.suggestedAction}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Missing Evidence */}
      {missingEvidence && missingEvidence.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => toggleSection('evidence')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Eksik Kanıt ({missingEvidence.length})
              </span>
            </div>
            {expandedSection === 'evidence' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'evidence' && (
            <div className="mt-3 space-y-2">
              {missingEvidence.map((evidence) => (
                <div
                  key={evidence.id}
                  className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', getPriorityColor(evidence.priority))}>
                        {evidence.priority}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{evidence.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{evidence.description}</p>
                    {evidence.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Son Tarih: {formatDate(evidence.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines && upcomingDeadlines.length > 0 && (
        <div className="px-6 py-4">
          <button
            onClick={() => toggleSection('deadlines')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Yaklaşan Son Tarihler ({upcomingDeadlines.length})
              </span>
            </div>
            {expandedSection === 'deadlines' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'deadlines' && (
            <div className="mt-3 space-y-2">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', getPriorityColor(deadline.importance))}>
                        {deadline.importance}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{deadline.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(deadline.date)}</span>
                      <span>•</span>
                      <span className="capitalize">{deadline.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
