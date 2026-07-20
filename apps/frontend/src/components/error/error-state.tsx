'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, RefreshCw, Sparkles, ArrowRight, XCircle,
  AlertTriangle, Info, CheckCircle, ExternalLink
} from 'lucide-react';
import { spacing, borderRadius, typography } from '@/lib/design-system';

export interface ErrorStateProps {
  // Error Information
  title: string;
  message: string;
  error?: Error;

  // Error Type
  type?: 'error' | 'warning' | 'info' | 'success';

  // Possible Reasons
  possibleReasons?: string[];

  // Suggested Solutions
  suggestedSolutions?: string[];

  // Actions
  onRetry?: () => void;
  onDismiss?: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  // AI Help
  showAIHelp?: boolean;
  onAIHelp?: () => void;
  aiSuggestion?: string;

  // Documentation Link
  documentationLink?: string;

  // Styling
  className?: string;
}

export function ErrorState({
  title,
  message,
  error,
  type = 'error',
  possibleReasons,
  suggestedSolutions,
  onRetry,
  onDismiss,
  secondaryAction,
  showAIHelp = true,
  onAIHelp,
  aiSuggestion,
  documentationLink,
  className,
}: ErrorStateProps) {
  const getErrorIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-yellow-400" />;
      case 'info':
        return <Info className="w-16 h-16 text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      default:
        return <AlertCircle className="w-16 h-16 text-red-400" />;
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getErrorTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      case 'success':
        return 'text-green-900';
      default:
        return 'text-red-900';
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6', className)}>
      {/* Error Icon */}
      <div className="mb-6">
        {getErrorIcon()}
      </div>

      {/* Error Content */}
      <div className="w-full max-w-md">
        <div className={cn('rounded-xl p-6 border', getErrorColor())}>
          {/* Title & Message */}
          <div className="text-center mb-6">
            <h3 className={cn('text-xl font-semibold mb-2', typography.h3, getErrorTextColor())}>
              {title}
            </h3>
            <p className={cn('text-sm text-gray-600', typography.small)}>
              {message}
            </p>
          </div>

          {/* Error Details */}
          {error && (
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <p className="text-xs font-mono text-gray-600 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Possible Reasons */}
          {possibleReasons && possibleReasons.length > 0 && (
            <div className="mb-6">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-3', typography.h6)}>
Olası Nedenler
              </h4>
              <ul className="space-y-2">
                {possibleReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Solutions */}
          {suggestedSolutions && suggestedSolutions.length > 0 && (
            <div className="mb-6">
              <h4 className={cn('text-sm font-semibold text-gray-900 mb-3', typography.h6)}>
Önerilen Çözümler
              </h4>
              <ul className="space-y-2">
                {suggestedSolutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Help */}
          {showAIHelp && (onAIHelp || aiSuggestion) && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className={cn('text-sm font-medium text-gray-900 mb-1', typography.h6)}>
AI Yardımı
                  </p>
                  {aiSuggestion ? (
                    <p className={cn('text-sm text-gray-600', typography.small)}>
                      {aiSuggestion}
                    </p>
                  ) : (
                    <p className={cn('text-sm text-gray-600 mb-3', typography.small)}>
                      AI bu sorunu teşhis etmenize ve çözmenize yardımcı olabilir.
                    </p>
                  )}
                  {onAIHelp && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onAIHelp}
                      className="flex items-center gap-2 mt-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI'den Yardım İste
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
Yeniden Dene
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="ml-auto"
              >
Kapat
              </Button>
            )}
          </div>

          {/* Documentation Link */}
          {documentationLink && (
            <div className="mt-4 text-center">
              <a
                href={documentationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
              >
                <ExternalLink className="w-3 h-3" />
Dokümantasyonu Gör
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
