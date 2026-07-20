'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, X, Filter, ChevronDown, ChevronUp, Sparkles,
  AlertTriangle, Scale, Briefcase, Calendar, FileText, 
  CheckSquare, DollarSign, ExternalLink, Clock
} from 'lucide-react';
import { spacing, borderRadius, typography } from '@/lib/design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type NotificationCategory = 
  | 'critical'
  | 'legal'
  | 'business'
  | 'ai'
  | 'calendar'
  | 'documents'
  | 'tasks'
  | 'finance';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  reason: string;
  relatedModule: string;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showFilter?: boolean;
  className?: string;
}

export function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  maxVisible = 5,
  showFilter = true,
  className,
}: NotificationSystemProps) {
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredNotifications = filterCategory === 'all'
    ? notifications
    : notifications.filter((n) => n.category === filterCategory);

  const displayNotifications = expanded
    ? filteredNotifications
    : filteredNotifications.slice(0, maxVisible);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'legal':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'business':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'documents':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'tasks':
        return <CheckSquare className="w-4 h-4 text-orange-500" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'legal':
        return 'bg-purple-50 border-purple-200';
      case 'business':
        return 'bg-blue-50 border-blue-200';
      case 'ai':
        return 'bg-purple-50 border-purple-200';
      case 'calendar':
        return 'bg-green-50 border-green-200';
      case 'documents':
        return 'bg-indigo-50 border-indigo-200';
      case 'tasks':
        return 'bg-orange-50 border-orange-200';
      case 'finance':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
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

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes}dk önce`;
    if (hours < 24) return `${hours}sa önce`;
    if (days < 7) return `${days}g önce`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
Bildirimler
              </h3>
              <p className={cn('text-sm text-gray-500', typography.caption)}>
                {filteredNotifications.length} bildirim
                {unreadCount > 0 && ` • ${unreadCount} okunmamış`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtre
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterCategory('all')}>
Tüm Kategoriler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('critical')}>
Kritik
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('legal')}>
Yasal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('business')}>
İş
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('ai')}>
                    AI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('calendar')}>
Takvim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('documents')}>
Belgeler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('tasks')}>
Görevler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('finance')}>
Finans
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {onMarkAllAsRead && unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
Tümünü okundu işaretle
              </Button>
            )}

            {onClearAll && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
Tümünü temizle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {displayNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={cn('text-sm text-gray-500', typography.caption)}>
Bildirim yok
            </p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                !notification.read && 'bg-purple-50/50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  getCategoryColor(notification.category)
                )}>
                  {getCategoryIcon(notification.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn('text-sm font-semibold text-gray-900', typography.h6)}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className={cn('text-sm text-gray-600', typography.small)}>
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={cn('text-xs', getPriorityColor(notification.priority))}>
                        {notification.priority}
                      </Badge>
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Neden: {notification.reason}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Modül: {notification.relatedModule}</span>
                    </div>
                  </div>

                  {/* Quick Action */}
                  {notification.quickAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={notification.quickAction.onClick}
                      className="mt-3 text-xs"
                    >
                      {notification.quickAction.label}
                    </Button>
                  )}

                  {/* Action URL */}
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 hover:text-purple-700"
                    >
                      <ExternalLink className="w-3 h-3" />
Detayları Gör
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expand Button */}
      {filteredNotifications.length > maxVisible && (
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
Daha Az Göster
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {filteredNotifications.length - maxVisible} Daha Fazla Göster
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
