'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, Clock, XCircle, ChevronDown, ChevronRight, 
  Play, Pause, RotateCcw, AlertCircle, Loader2
} from 'lucide-react';
import { spacing, borderRadius, typography, animations } from '@/lib/design-system';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'read' | 'analyze' | 'compare' | 'generate' | 'review' | 'complete' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  estimatedTime?: number;
  actualTime?: number;
  result?: any;
  error?: string;
  responsibleUser?: string;
}

export interface WorkflowVisualizationProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  onExecute?: () => void;
  onPause?: () => void;
  onRetry?: () => void;
  showEstimatedTime?: boolean;
  showActualTime?: boolean;
  showResponsibleUser?: boolean;
  expandable?: boolean;
  className?: string;
}

export function WorkflowVisualization({
  steps,
  currentStepIndex,
  onStepClick,
  onExecute,
  onPause,
  onRetry,
  showEstimatedTime = true,
  showActualTime = true,
  showResponsibleUser = true,
  expandable = true,
  className,
}: WorkflowVisualizationProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStepExpansion = (index: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepTypeIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'read':
        return '📖';
      case 'analyze':
        return '🔍';
      case 'compare':
        return '⚖️';
      case 'generate':
        return '✨';
      case 'review':
        return '👁️';
      case 'complete':
        return '✅';
      default:
        return '⚙️';
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-purple-50 border-purple-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'skipped':
        return 'bg-gray-50 border-gray-200';
      case 'pending':
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    const completed = steps.filter((s) => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  const overallStatus = () => {
    if (steps.some((s) => s.status === 'failed')) return 'failed';
    if (steps.some((s) => s.status === 'running')) return 'running';
    if (steps.every((s) => s.status === 'completed' || s.status === 'skipped')) return 'completed';
    return 'pending';
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
AI İş Akışı
            </h3>
            <p className={cn('text-sm text-gray-500', typography.caption)}>
              {steps.length} adım • %{getProgressPercentage()} tamamlandı
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overallStatus() === 'running' && onPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
Duraklat
              </Button>
            )}
            {overallStatus() === 'failed' && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
Yeniden Dene
              </Button>
            )}
            {overallStatus() === 'pending' && onExecute && (
              <Button
                size="sm"
                onClick={onExecute}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Play className="w-4 h-4" />
Çalıştır
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              overallStatus() === 'completed' ? 'bg-green-500' : 'bg-purple-500'
            )}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="p-6">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(index);
            const isCurrentStep = index === currentStepIndex;
            const isPastStep = index < currentStepIndex;

            return (
              <div key={step.id}>
                {/* Step Header */}
                <div
                  onClick={() => onStepClick?.(index)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all',
                    getStepStatusColor(step.status),
                    isCurrentStep && 'ring-2 ring-purple-500 ring-offset-2',
                    'hover:shadow-md'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold',
                          step.status === 'completed' && 'bg-green-500 text-white',
                          step.status === 'running' && 'bg-purple-500 text-white',
                          step.status === 'failed' && 'bg-red-500 text-white',
                          step.status === 'skipped' && 'bg-gray-300 text-gray-600',
                          step.status === 'pending' && 'bg-gray-200 text-gray-600'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="text-xl">{getStepTypeIcon(step.type)}</div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={cn('text-sm font-semibold text-gray-900', typography.h6)}>
                            {step.name}
                          </h4>
                          {getStepIcon(step)}
                        </div>
                        {expandable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStepExpansion(index);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Status Text */}
                      <p className={cn('text-xs text-gray-500 mt-1', typography.caption)}>
                        {step.status === 'running' && 'İşleniyor...'}
                        {step.status === 'completed' && 'Tamamlandı'}
                        {step.status === 'failed' && step.error}
                        {step.status === 'skipped' && 'Atlandı'}
                        {step.status === 'pending' && isCurrentStep && 'Başlamayı bekliyor'}
                        {step.status === 'pending' && !isCurrentStep && 'Beklemede'}
                      </p>

                      {/* Time Information */}
                      {(showEstimatedTime || showActualTime) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {showEstimatedTime && step.estimatedTime && (
                            <span>Tahmin: {step.estimatedTime}dk</span>
                          )}
                          {showActualTime && step.actualTime && (
                            <span>Gerçek: {step.actualTime}dk</span>
                          )}
                        </div>
                      )}

                      {/* Responsible User */}
                      {showResponsibleUser && step.responsibleUser && (
                        <div className="mt-2 text-xs text-gray-500">
                          Sorumlu: {step.responsibleUser}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {expandable && isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {step.result && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Sonuç</p>
                          <p className="text-xs text-gray-600">
                            {typeof step.result === 'string' ? step.result : JSON.stringify(step.result, null, 2)}
                          </p>
                        </div>
                      )}
                      {step.error && step.status === 'failed' && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-700 mb-2">Hata Detayları</p>
                          <p className="text-xs text-red-600">{step.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-6 bg-gray-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Tamamlandı</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Çalışıyor</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Başarısız</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span>Beklemede</span>
            </div>
          </div>
          <div>
            Toplam Tahmini Süre: {steps.reduce((acc, step) => acc + (step.estimatedTime || 0), 0)}dk
          </div>
        </div>
      </div>
    </div>
  );
}
