'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Sparkles, BookOpen, Scale, TrendingUp,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle,
  ExternalLink, Network, ArrowRight, X
} from 'lucide-react';
import { spacing, borderRadius, typography } from '@/lib/design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface LegalDecision {
  id: string;
  title: string;
  citation: string;
  court: string;
  year: number;
  outcome: string;
  relevance: number;
  summary: string;
  keyPoints: string[];
}

export interface ReferencedLaw {
  id: string;
  name: string;
  citation: string;
  year: number;
  relevance: number;
  summary: string;
}

export interface JudgeTendency {
  judgeId: string;
  name: string;
  court: string;
  tendency: 'pro-plaintiff' | 'pro-defendant' | 'neutral';
  winRate: number;
  caseCount: number;
}

export interface CitationNetwork {
  decisions: Array<{
    id: string;
    title: string;
    citationCount: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
}

export interface LegalResearchExperienceProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;

  // Results
  decisions: LegalDecision[];
  laws: ReferencedLaw[];
  judgeTendencies: JudgeTendency[];
  citationNetwork: CitationNetwork;

  // AI Summary
  aiSummary?: string;
  contradictoryDecisions?: string[];

  // Filters
  showFilters?: boolean;
  filters?: {
    court?: string;
    yearRange?: [number, number];
    outcome?: string;
  };

  // Actions
  onDecisionClick?: (decision: LegalDecision) => void;
  onLawClick?: (law: ReferencedLaw) => void;
  onExportResults?: () => void;

  // Styling
  className?: string;
}

export function LegalResearchExperience({
  searchQuery,
  onSearchChange,
  onSearch,
  decisions,
  laws,
  judgeTendencies,
  citationNetwork,
  aiSummary,
  contradictoryDecisions,
  showFilters = true,
  filters,
  onDecisionClick,
  onLawClick,
  onExportResults,
  className,
}: LegalResearchExperienceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<LegalDecision | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'granted':
      case 'affirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'denied':
      case 'reversed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'partial':
      case 'modified':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTendencyColor = (tendency: string) => {
    switch (tendency) {
      case 'pro-plaintiff':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pro-defendant':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Search Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Yasal kararları, yasaları ve emsal kararları ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Button onClick={onSearch} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white">
            <Search className="w-4 h-4" />
Ara
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
Filtreler
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Tüm Mahkemeler</DropdownMenuItem>
                <DropdownMenuItem>Yargıtay</DropdownMenuItem>
                <DropdownMenuItem>İstinaf Mahkemesi</DropdownMenuItem>
                <DropdownMenuItem>Ağır Ceza Mahkemesi</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {filters?.court && (
              <Badge variant="outline" className="text-xs">
                {filters.court}
              </Badge>
            )}
            {onExportResults && (
              <Button variant="outline" size="sm" onClick={onExportResults} className="ml-auto">
Sonuçları Dışa Aktar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-2', typography.h6)}>
AI Araştırma Özeti
              </h4>
              <p className={cn('text-sm text-gray-700', typography.small)}>
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contradictory Decisions */}
      {contradictoryDecisions && contradictoryDecisions.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-2', typography.h6)}>
Çelişkili Kararlar Bulundu
              </h4>
              <ul className="space-y-1">
                {contradictoryDecisions.map((decision, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legal Decisions */}
          <div>
            <button
              onClick={() => toggleSection('decisions')}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
Yasal Kararlar ({decisions.length})
                </span>
              </div>
              {expandedSection === 'decisions' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'decisions' && (
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <div
                    key={decision.id}
                    onClick={() => {
                      setSelectedDecision(decision);
                      onDecisionClick?.(decision);
                    }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{decision.title}</h4>
                      <Badge className={cn('text-xs', getOutcomeColor(decision.outcome))}>
                        {decision.outcome}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{decision.citation}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{decision.court}</span>
                      <span>•</span>
                      <span>{decision.year}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        %{decision.relevance} ilgili
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referenced Laws */}
          <div>
            <button
              onClick={() => toggleSection('laws')}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
Referans Yasalar ({laws.length})
                </span>
              </div>
              {expandedSection === 'laws' ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSection === 'laws' && (
              <div className="space-y-3">
                {laws.map((law) => (
                  <div
                    key={law.id}
                    onClick={() => onLawClick?.(law)}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{law.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        %{law.relevance} ilgili
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{law.citation}</p>
                    <p className="text-xs text-gray-600">{law.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Judge Tendencies */}
        <div className="mt-6">
          <button
            onClick={() => toggleSection('judges')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Hakim Eğilimleri ({judgeTendencies.length})
              </span>
            </div>
            {expandedSection === 'judges' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'judges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {judgeTendencies.map((judge) => (
                <div key={judge.judgeId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{judge.name}</h4>
                    <Badge className={cn('text-xs', getTendencyColor(judge.tendency))}>
                      {judge.tendency}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{judge.court}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{judge.caseCount} dava</span>
                    <span className={cn('font-semibold', judge.winRate >= 60 ? 'text-green-600' : judge.winRate <= 40 ? 'text-red-600' : 'text-gray-600')}>
                      %{judge.winRate} kazanma oranı
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citation Network */}
        <div className="mt-6">
          <button
            onClick={() => toggleSection('network')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
Atıf Ağı ({citationNetwork.decisions.length})
              </span>
            </div>
            {expandedSection === 'network' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === 'network' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-gray-600">Yüksek atıf sayısı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-600">Orta atıf sayısı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-xs text-gray-600">Düşük atıf sayısı</span>
                </div>
              </div>
              <div className="space-y-2">
                {citationNetwork.decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{decision.title}</p>
                      <p className="text-xs text-gray-500">{decision.citationCount} atıf</p>
                    </div>
                    <div
                      className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden"
                      style={{ width: `${Math.min(decision.citationCount * 2, 100)}%` }}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          decision.citationCount > 50 ? 'bg-purple-500' : decision.citationCount > 20 ? 'bg-blue-500' : 'bg-gray-400'
                        )}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Decision Detail */}
      {selectedDecision && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between mb-3">
            <h4 className={cn('text-sm font-semibold text-gray-900', typography.h6)}>
              {selectedDecision.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDecision(null)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className={cn('text-sm text-gray-600 mb-3', typography.small)}>
            {selectedDecision.summary}
          </p>
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Önemli Noktalar:</p>
            <ul className="space-y-1">
              {selectedDecision.keyPoints.map((point, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
Tam Kararı Gör
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
