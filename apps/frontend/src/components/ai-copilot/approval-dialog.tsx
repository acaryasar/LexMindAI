'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalAction {
  id: string;
  type: 'delete' | 'send_email' | 'submit_document' | 'archive_file' | 'share_document' | 'court_filing' | 'send_invoice';
  title: string;
  description: string;
  details?: string;
  consequences?: string[];
  requiresConfirmation: boolean;
}

interface ApprovalDialogProps {
  action: ApprovalAction;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ApprovalDialog({
  action,
  onApprove,
  onReject,
  onClose,
  isOpen,
}: ApprovalDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const getActionIcon = () => {
    return <AlertTriangle className="w-6 h-6 text-orange-500" />;
  };

  const getActionColor = () => {
    switch (action.type) {
      case 'delete':
        return 'bg-red-50 border-red-200';
      case 'send_email':
        return 'bg-blue-50 border-blue-200';
      case 'submit_document':
        return 'bg-purple-50 border-purple-200';
      case 'archive_file':
        return 'bg-gray-50 border-gray-200';
      case 'share_document':
        return 'bg-green-50 border-green-200';
      case 'court_filing':
        return 'bg-orange-50 border-orange-200';
      case 'send_invoice':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={cn('p-6 border-b', getActionColor())}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                {getActionIcon()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Approval Required</h3>
                <p className="text-sm text-gray-600">{action.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{action.description}</p>

          {action.details && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600">{action.details}</p>
            </div>
          )}

          {action.consequences && action.consequences.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">
                This action will:
              </p>
              <ul className="space-y-2">
                {action.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                    {consequence}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900">Irreversible Action</p>
                <p className="text-xs text-orange-700 mt-1">
                  This action cannot be undone. Please review carefully before approving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                'bg-white border border-gray-200 text-gray-700',
                'hover:bg-gray-50 hover:border-gray-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                'hover:from-purple-600 hover:to-purple-700',
                'shadow-md shadow-purple-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve & Execute
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage approval state
export function useApprovalDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((approved: boolean) => void) | null>(null);

  const requestApproval = (action: ApprovalAction): Promise<boolean> => {
    return new Promise((resolve) => {
      setCurrentAction(action);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleApprove = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setCurrentAction(null);
    setResolvePromise(null);
  };

  const handleReject = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setCurrentAction(null);
    setResolvePromise(null);
  };

  const handleClose = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setCurrentAction(null);
    setResolvePromise(null);
  };

  return {
    isOpen,
    currentAction,
    requestApproval,
    handleApprove,
    handleReject,
    handleClose,
  };
}
