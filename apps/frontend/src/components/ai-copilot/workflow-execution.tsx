'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Pause, Play, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: number;
  progress: number;
  steps: WorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
}

interface WorkflowExecutionProps {
  execution: WorkflowExecution;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export function WorkflowExecution({
  execution,
  onPause,
  onResume,
  onCancel,
  onDismiss,
}: WorkflowExecutionProps) {
  const [localProgress, setLocalProgress] = useState(execution.progress);

  useEffect(() => {
    setLocalProgress(execution.progress);
  }, [execution.progress]);

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-purple-50 border-purple-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getExecutionStatus = () => {
    switch (execution.status) {
      case 'running':
        return { text: 'Running', color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'completed':
        return { text: 'Completed', color: 'text-green-600', bg: 'bg-green-100' };
      case 'failed':
        return { text: 'Failed', color: 'text-red-600', bg: 'bg-red-100' };
      case 'paused':
        return { text: 'Paused', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const statusInfo = getExecutionStatus();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {execution.status === 'running' && (
                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              )}
              {execution.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {execution.status === 'failed' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {execution.status === 'paused' && (
                <Pause className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-semibold text-gray-900">AI Workflow</span>
            </div>
            <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusInfo.bg, statusInfo.color)}>
              {statusInfo.text}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>{localProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                execution.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'
              )}
              style={{ width: `${localProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {execution.steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'p-3 rounded-xl border transition-all',
              getStatusColor(step.status)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                  <span className="text-xs text-gray-500 capitalize">{step.status}</span>
                </div>
                {step.status === 'running' && (
                  <p className="text-xs text-purple-600 mt-1">Processing...</p>
                )}
                {step.status === 'failed' && step.error && (
                  <p className="text-xs text-red-600 mt-1">{step.error}</p>
                )}
                {step.status === 'completed' && step.result && (
                  <p className="text-xs text-green-600 mt-1">
                    {typeof step.result === 'string' ? step.result : 'Completed successfully'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          {execution.status === 'running' && onPause && (
            <button
              onClick={onPause}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          {execution.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          )}
          {(execution.status === 'running' || execution.status === 'paused') && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          {execution.status === 'completed' && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
