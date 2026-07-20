'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, TrendingUp, DollarSign, FileText, Calendar, 
  User, Sparkles, ChevronDown, ChevronUp, ArrowRight,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { spacing, borderRadius, typography, getRelationshipScoreColor, getActivityLevelColor } from '@/lib/design-system';

export interface OpenCase {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export interface MissingDocument {
  id: string;
  type: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface UpcomingOpportunity {
  id: string;
  title: string;
  estimatedValue: number;
  probability: number;
  description: string;
}

export interface ClientExperienceProps {
  // Client Info
  name: string;
  company?: string;
  type: 'individual' | 'corporate';
  status: 'active' | 'inactive' | 'prospect';
  since: Date;

  // Relationship Score
  relationshipScore: number;
  activityLevel: 'high' | 'medium' | 'low';

  // Business Metrics
  revenue?: number;
  openCases?: number;
  totalCases?: number;

  // Communication
  lastContact?: Date;
  nextMeeting?: Date;

  // Open Cases
  openCasesList?: OpenCase[];

  // Missing Documents
  missingDocuments?: MissingDocument[];

  // Upcoming Opportunities
  upcomingOpportunities?: UpcomingOpportunity[];

  // AI Recommendation
  aiRecommendation?: {
    message: string;
    suggestedAction: string;
    onAction?: () => void;
  };

  // Actions
  onViewDetails?: () => void;
  onScheduleMeeting?: () => void;
  onSendUpdate?: () => void;
  onAddDocument?: () => void;

  // Styling
  className?: string;
}

export function ClientExperience({
  name,
  company,
  type,
  status,
  since,
  relationshipScore,
  activityLevel,
  revenue,
  openCases,
  totalCases,
  lastContact,
  nextMeeting,
  openCasesList,
  missingDocuments,
  upcomingOpportunities,
  aiRecommendation,
  onViewDetails,
  onScheduleMeeting,
  onSendUpdate,
  onAddDocument,
  className,
}: ClientExperienceProps) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'prospect':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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
            {/* Client Icon */}
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              {type === 'corporate' ? (
                <Building2 className="w-6 h-6 text-purple-500" />
              ) : (
                <User className="w-6 h-6 text-purple-500" />
              )}
            </div>

            {/* Client Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
                  {name}
                </h3>
                {company && <span className="text-sm text-gray-500">({company})</span>}
                <Badge className={cn('text-xs', getStatusColor(status))}>
                  {status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="capitalize">{type}</span>
                <span>•</span>
                <span>Since {formatDate(since)}</span>
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
            {onScheduleMeeting && (
              <Button variant="outline" size="sm" onClick={onScheduleMeeting} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
Toplantı Planla
              </Button>
            )}
            {onSendUpdate && (
              <Button variant="outline" size="sm" onClick={onSendUpdate}>
Güncelleme Gönder
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Relationship Score & Activity Level */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          {/* Relationship Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">İlişki Puanı</span>
              </div>
              <span className={cn('text-2xl font-bold', getRelationshipScoreColor(relationshipScore))}>
                {relationshipScore}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getRelationshipScoreColor(relationshipScore).replace('text-', 'bg-'))}
                style={{ width: `${relationshipScore}%` }}
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Aktivite Seviyesi</span>
              </div>
              <span className={cn('text-sm font-semibold px-2 py-1 rounded-full', getActivityLevelColor(activityLevel))}>
                {activityLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              {lastContact && (
                <div className="flex items-center gap-1">
                  <span>Son iletişim: {formatDate(lastContact)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      {(revenue !== undefined || openCases !== undefined || totalCases !== undefined) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {revenue !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenue)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Toplam Gelir</p>
              </div>
            )}
            {openCases !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {openCases}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Açık Davalar</p>
              </div>
            )}
            {totalCases !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {totalCases}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Toplam Davalar</p>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Open Cases */}
      {openCasesList && openCasesList.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => toggleSection('cases')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Açık Davalar ({openCasesList.length})
              </span>
            </div>
            {expandedSection === 'cases' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'cases' && (
            <div className="mt-3 space-y-2">
              {openCasesList.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {caseItem.status}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{caseItem.title}</span>
                    </div>
                    <Badge className={cn('text-xs', getUrgencyColor(caseItem.priority))}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Missing Documents */}
      {missingDocuments && missingDocuments.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => toggleSection('documents')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Eksik Belgeler ({missingDocuments.length})
              </span>
            </div>
            {expandedSection === 'documents' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'documents' && (
            <div className="mt-3 space-y-2">
              {missingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', getUrgencyColor(doc.urgency))}>
                        {doc.urgency}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{doc.description}</p>
                  </div>
                </div>
              ))}
              {onAddDocument && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddDocument}
                  className="w-full mt-2"
                >
Belge Ekle
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Opportunities */}
      {upcomingOpportunities && upcomingOpportunities.length > 0 && (
        <div className="px-6 py-4">
          <button
            onClick={() => toggleSection('opportunities')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Yaklaşan Fırsatlar ({upcomingOpportunities.length})
              </span>
            </div>
            {expandedSection === 'opportunities' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'opportunities' && (
            <div className="mt-3 space-y-2">
              {upcomingOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{opportunity.title}</span>
                    <span className="text-sm font-semibold text-green-700">
                      {formatCurrency(opportunity.estimatedValue)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{opportunity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>%{opportunity.probability} olasılık</span>
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
