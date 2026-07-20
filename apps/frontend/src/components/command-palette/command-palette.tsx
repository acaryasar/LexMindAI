'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Search, Sparkles, FileText, Scale, Users, Calendar,
  CheckSquare, DollarSign, Settings, ChevronRight, ArrowRight,
  Command, X, Clock, Star
} from 'lucide-react';
import { spacing, borderRadius, typography, animations } from '@/lib/design-system';

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  category: 'navigation' | 'actions' | 'ai' | 'settings' | 'recent';
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandAction[];
  recentActions?: CommandAction[];
  placeholder?: string;
  showAI?: boolean;
  onAIQuery?: (query: string) => Promise<string>;
}

export function CommandPalette({
  isOpen,
  onClose,
  actions,
  recentActions = [],
  placeholder = 'Type a command or search...',
  showAI = true,
  onAIQuery,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAISearching, setIsAISearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter actions based on query
  const filteredActions = useCallback(() => {
    if (!query) return actions;
    
    const lowerQuery = query.toLowerCase();
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(lowerQuery) ||
        action.description?.toLowerCase().includes(lowerQuery)
    );
  }, [actions, query]);

  const displayActions = filteredActions();

  // Group actions by category
  const groupedActions = displayActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, displayActions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (displayActions[selectedIndex]) {
            displayActions[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayActions, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
      setAiSuggestion(null);
    }
  }, [isOpen]);

  // AI Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && showAI && onAIQuery) {
        setIsAISearching(true);
        try {
          const suggestion = await onAIQuery(query);
          setAiSuggestion(suggestion);
        } catch (error) {
          console.error('AI search failed:', error);
        } finally {
          setIsAISearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showAI, onAIQuery]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <ArrowRight className="w-4 h-4" />;
      case 'actions':
        return <CheckSquare className="w-4 h-4" />;
      case 'ai':
        return <Sparkles className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Navigasyon';
      case 'actions':
        return 'İşlemler';
      case 'ai':
        return 'AI Destekli';
      case 'settings':
        return 'Ayarlar';
      case 'recent':
        return 'Son Kullanılanlar';
      default:
        return category;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Command Palette */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ borderRadius: borderRadius.dialog }}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                ESC
              </kbd>
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">AI Önerisi</p>
                <p className="text-sm text-gray-600">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto">
          {/* Recent Actions */}
          {recentActions.length > 0 && !query && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
Son Kullanılanlar
                </span>
              </div>
              <div className="space-y-1">
                {recentActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {action.icon || getCategoryIcon(action.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                      {action.description && (
                        <p className="text-xs text-gray-500 truncate">{action.description}</p>
                      )}
                    </div>
                    {action.shortcut && (
                      <div className="flex gap-1">
                        {action.shortcut.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-0.5 text-xs bg-gray-100 rounded border border-gray-200"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Actions by Category */}
          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category} className="p-4 border-t border-gray-100 first:border-t-0">
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(category)}
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getCategoryLabel(category)}
                </span>
              </div>
              <div className="space-y-1">
                {categoryActions.map((action, index) => {
                  const globalIndex = displayActions.indexOf(action);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        isSelected ? 'bg-purple-100' : 'hover:bg-gray-100',
                        'focus:outline-none focus:ring-2 focus:ring-purple-500'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-purple-200' : 'bg-gray-100'
                      )}>
                        {action.icon || getCategoryIcon(action.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-purple-900' : 'text-gray-900'
                        )}>
                          {action.label}
                        </p>
                        {action.description && (
                          <p className="text-xs text-gray-500 truncate">{action.description}</p>
                        )}
                      </div>
                      {action.shortcut && (
                        <div className="flex gap-1">
                          {action.shortcut.map((key) => (
                            <kbd
                              key={key}
                              className="px-2 py-0.5 text-xs bg-gray-100 rounded border border-gray-200"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-purple-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* No Results */}
          {displayActions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Sonuç bulunamadı</p>
            </div>
          )}
        </div>

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
          {showAI && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>AI destekli arama</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
