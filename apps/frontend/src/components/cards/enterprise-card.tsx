'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, ChevronUp, MoreVertical, Sparkles, Clock, 
  User, AlertTriangle, CheckCircle, TrendingUp, Calendar
} from 'lucide-react';
import { 
  priority, status, borderRadius, spacing, typography, 
  getConfidenceColor, getRiskColor, getSuccessProbabilityColor 
} from '@/lib/design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface AIInsight {
  type: 'opportunity' | 'risk' | 'suggestion' | 'warning';
  message: string;
  confidence?: number;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export interface EnterpriseCardProps {
  // Basic Card Info
  title: string;
  subtitle?: string;
  description?: string;
  
  // Status & Priority
  status?: 'active' | 'pending' | 'completed' | 'cancelled' | 'archived';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  
  // Visual Elements
  icon?: React.ReactNode;
  avatar?: string;
  avatarInitials?: string;
  
  // Metadata
  owner?: string;
  lastUpdate?: string;
  dueDate?: string;
  
  // Metrics
  metrics?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  
  // AI Features
  aiInsight?: AIInsight;
  confidenceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  successProbability?: number;
  
  // Actions
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  }>;
  
  // Expandable Details
  details?: React.ReactNode;
  expandable?: boolean;
  
  // Styling
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function EnterpriseCard({
  title,
  subtitle,
  description,
  status,
  priority,
  icon,
  avatar,
  avatarInitials,
  owner,
  lastUpdate,
  dueDate,
  metrics,
  aiInsight,
  confidenceScore,
  riskLevel,
  successProbability,
  actions,
  details,
  expandable = false,
  className,
  onClick,
  hoverable = true,
}: EnterpriseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyle = (p: string) => {
    const styles: Record<string, { color: string; bg: string; border: string; badge: string }> = {
      critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700 border-red-200' },
      high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
      medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700 border-green-200' },
    };
    return styles[p] || null;
  };

  const getStatusStyle = (s: string) => {
    const styles: Record<string, { color: string; bg: string; border: string; dot: string; badge: string }> = {
      active: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 border-green-200' },
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      completed: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
      cancelled: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200' },
      archived: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return styles[s] || null;
  };

  const priorityStyle = priority ? getPriorityStyle(priority) : null;
  const statusStyle = status ? getStatusStyle(status) : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
        'transition-all duration-200',
        hoverable && 'hover:shadow-md hover:border-gray-200 cursor-pointer',
        className
      )}
      style={{ borderRadius: borderRadius.card }}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon/Avatar + Content */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Icon or Avatar */}
            {avatar || avatarInitials ? (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                style={{ backgroundColor: colors.primary[500] as string }}
              >
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  avatarInitials
                )}
              </div>
            ) : icon ? (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 flex-shrink-0">
                {icon}
              </div>
            ) : null}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title & Badges */}
              <div className="flex items-start gap-2 mb-1">
                <h3 className={cn('text-lg font-semibold text-gray-900 truncate', typography.h5)}>
                  {title}
                </h3>
                {priority && priorityStyle && (
                  <Badge className={cn('text-xs px-2 py-0.5', priorityStyle.badge)}>
                    {priority}
                  </Badge>
                )}
                {status && statusStyle && (
                  <Badge className={cn('text-xs px-2 py-0.5', statusStyle.badge)}>
                    {status}
                  </Badge>
                )}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p className={cn('text-sm text-gray-600 mb-2', typography.small)}>
                  {subtitle}
                </p>
              )}

              {/* Description */}
              {description && (
                <p className={cn('text-sm text-gray-500 line-clamp-2', typography.caption)}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={cn(
                        action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {expandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value as string | number}
                </div>
                <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* AI Insight */}
        {aiInsight && (
          <div
            className={cn(
              'mt-4 p-4 rounded-xl border',
              aiInsight.type === 'opportunity' && 'bg-green-50 border-green-200',
              aiInsight.type === 'risk' && 'bg-red-50 border-red-200',
              aiInsight.type === 'suggestion' && 'bg-blue-50 border-blue-200',
              aiInsight.type === 'warning' && 'bg-yellow-50 border-yellow-200'
            )}
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {aiInsight.type === 'opportunity' && 'AI Fırsat'}
                  {aiInsight.type === 'risk' && 'AI Risk Uyarısı'}
                  {aiInsight.type === 'suggestion' && 'AI Önerisi'}
                  {aiInsight.type === 'warning' && 'AI Uyarısı'}
                </p>
                <p className="text-sm text-gray-600">{aiInsight.message}</p>
                {aiInsight.confidence && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={cn('text-xs px-2 py-1 rounded-full', getConfidenceColor(aiInsight.confidence))}>
                      %{aiInsight.confidence} güven
                    </div>
                  </div>
                )}
                {aiInsight.actionable && aiInsight.actionLabel && aiInsight.onAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      aiInsight.onAction?.();
                    }}
                    className="mt-3 text-xs"
                  >
                    {aiInsight.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {confidenceScore && !aiInsight && (
          <div className="mt-4 flex items-center gap-2">
            <div className={cn('text-xs px-2 py-1 rounded-full', getConfidenceColor(confidenceScore))}>
              %{confidenceScore} güven
            </div>
          </div>
        )}

        {/* Risk Level */}
        {riskLevel && (
          <div className="mt-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <span className={cn('text-xs px-2 py-1 rounded-full border', getRiskColor(riskLevel))}>
Risk: {riskLevel}
            </span>
          </div>
        )}

        {/* Success Probability */}
        {successProbability !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className={cn('text-sm font-medium', getSuccessProbabilityColor(successProbability))}>
              %{successProbability} başarı olasılığı
            </span>
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      {(owner || lastUpdate || dueDate) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {owner && (
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{owner}</span>
                </div>
              )}
              {lastUpdate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lastUpdate}</span>
                </div>
              )}
            </div>
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dueDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {expandable && isExpanded && details && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {details}
        </div>
      )}
    </div>
  );
}

// Color palette for avatars
const colors = {
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
};
