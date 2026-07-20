'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Sparkles, Clock, TrendingUp, X, Mic,
  ChevronDown, ChevronUp, Filter, ArrowRight, ExternalLink,
  Scale, Users, FileText, CheckSquare, Calendar
} from 'lucide-react';
import { spacing, borderRadius, typography, animations } from '@/lib/design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface SearchResult {
  id: string;
  type: 'case' | 'client' | 'document' | 'task' | 'calendar';
  title: string;
  description: string;
  relevance: number;
  url: string;
  metadata?: Record<string, any>;
  aiSummary?: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface SemanticSearchProps {
  placeholder?: string;
  showVoiceInput?: boolean;
  showSavedSearches?: boolean;
  showRecentSearches?: boolean;
  showSuggestedSearches?: boolean;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onVoiceInput?: () => Promise<string>;
  savedSearches?: SavedSearch[];
  recentSearches?: string[];
  suggestedSearches?: string[];
  onResultClick?: (result: SearchResult) => void;
  onSavedSearchClick?: (search: SavedSearch) => void;
  className?: string;
}

export function SemanticSearch({
  placeholder = 'Search cases, clients, documents, and more...',
  showVoiceInput = true,
  showSavedSearches = true,
  showRecentSearches = true,
  showSuggestedSearches = true,
  onSearch,
  onVoiceInput,
  savedSearches = [],
  recentSearches = [],
  suggestedSearches = [],
  onResultClick,
  onSavedSearchClick,
  className,
}: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'saved' | 'recent' | 'suggested' | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !onSearch) return;

    setIsSearching(true);
    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch]);

  const handleVoiceInput = useCallback(async () => {
    if (!onVoiceInput) return;

    try {
      const voiceQuery = await onVoiceInput();
      setQuery(voiceQuery);
      await handleSearch(voiceQuery);
    } catch (error) {
      console.error('Voice input failed:', error);
    }
  }, [onVoiceInput, handleSearch]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && onSearch) {
        await handleSearch(query);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch, handleSearch]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'client':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-orange-500" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'case':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'client':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'document':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'task':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'calendar':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="pl-10 pr-24 py-3 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500"
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowDropdown(false);
              }}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {showVoiceInput && onVoiceInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              className="h-7 w-7 p-0"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Loading State */}
          {isSearching && (
            <div className="p-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
            </div>
          )}

          {/* Search Results */}
          {!isSearching && results.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
AI Destekli Sonuçlar
                </span>
              </div>
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => {
                      onResultClick?.(result);
                      setShowDropdown(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      getResultTypeColor(result.type)
                    )}>
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{result.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          %{result.relevance} eşleşme
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{result.description}</p>
                      {result.aiSummary && (
                        <p className="text-xs text-purple-600 italic">{result.aiSummary}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {!isSearching && !query && showSavedSearches && savedSearches.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setExpandedSection(expandedSection === 'saved' ? null : 'saved')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kaydedilen Aramalar ({savedSearches.length})
                  </span>
                </div>
                {expandedSection === 'saved' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'saved' && (
                <div className="space-y-2">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      onClick={() => {
                        setQuery(search.query);
                        onSavedSearchClick?.(search);
                        setShowDropdown(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{search.query}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{search.resultCount} sonuç</span>
                        <span>•</span>
                        <span>{formatDate(search.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {!isSearching && !query && showRecentSearches && recentSearches.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setExpandedSection(expandedSection === 'recent' ? null : 'recent')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
Son Aramalar ({recentSearches.length})
                  </span>
                </div>
                {expandedSection === 'recent' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'recent' && (
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suggested Searches */}
          {!isSearching && !query && showSuggestedSearches && suggestedSearches.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setExpandedSection(expandedSection === 'suggested' ? null : 'suggested')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
Önerilen Aramalar
                  </span>
                </div>
                {expandedSection === 'suggested' ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSection === 'suggested' && (
                <div className="flex flex-wrap gap-2">
                  {suggestedSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="cursor-pointer hover:bg-purple-50 hover:border-purple-200"
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Natural Language Hint */}
          {!isSearching && !query && (
            <div className="p-4 border-t border-gray-100 bg-purple-50">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
Doğal Dil Aramasını Deneyin
                  </p>
                  <p className="text-xs text-gray-600">
                    "Geçen aydaki tüm yüksek öncelikli davaları göster" veya "Sözleşme anlaşmazlıklarıyla ilgili belgeleri bulun" gibi doğal dil kullanarak arama yapın
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↑↓</kbd>
                <span>Navigasyon</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↵</kbd>
                <span>Seç</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">ESC</kbd>
                <span>Kapat</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>AI destekli</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
