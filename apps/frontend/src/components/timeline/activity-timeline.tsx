'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Calendar, User, FileText, MessageSquare, Sparkles, 
  ChevronDown, ChevronUp, Clock, Filter, MoreVertical
} from 'lucide-react';
import { spacing, borderRadius, typography, animations } from '@/lib/design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type TimelineEventType = 
  | 'creation'
  | 'update'
  | 'ai_action'
  | 'comment'
  | 'assignment'
  | 'status_change'
  | 'document_upload'
  | 'deadline'
  | 'milestone';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  metadata?: Record<string, any>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  aiGenerated?: boolean;
}

export interface ActivityTimelineProps {
  events: TimelineEvent[];
  objectType?: 'case' | 'client' | 'document' | 'contract' | 'task';
  objectId?: string;
  showFilter?: boolean;
  maxEvents?: number;
  expandable?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

export function ActivityTimeline({
  events,
  objectType,
  objectId,
  showFilter = true,
  maxEvents,
  expandable = true,
  onEventClick,
  className,
}: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<TimelineEventType | 'all'>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter((event) => event.type === filterType);

  const displayEvents = maxEvents && !expanded 
    ? filteredEvents.slice(0, maxEvents) 
    : filteredEvents;

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'creation':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'update':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'ai_action':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
      case 'assignment':
        return <User className="w-4 h-4 text-orange-500" />;
      case 'status_change':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'document_upload':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-red-500" />;
      case 'milestone':
        return <Calendar className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'creation':
        return 'bg-green-50 border-green-200';
      case 'update':
        return 'bg-blue-50 border-blue-200';
      case 'ai_action':
        return 'bg-purple-50 border-purple-200';
      case 'comment':
        return 'bg-gray-50 border-gray-200';
      case 'assignment':
        return 'bg-orange-50 border-orange-200';
      case 'status_change':
        return 'bg-yellow-50 border-yellow-200';
      case 'document_upload':
        return 'bg-indigo-50 border-indigo-200';
      case 'deadline':
        return 'bg-red-50 border-red-200';
      case 'milestone':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  const formatFullTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn('text-lg font-semibold text-gray-900', typography.h4)}>
              Etkinlik Zaman Çizelgesi
            </h3>
            <p className={cn('text-sm text-gray-500', typography.caption)}>
              {filteredEvents.length} etkinlik
            </p>
          </div>

          {showFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtre
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  Tüm Etkinlikler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('creation')}>
                  Oluşturma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('update')}>
                  Güncellemeler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('ai_action')}>
                  AI İşlemleri
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('comment')}>
                  Yorumlar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('assignment')}>
                  Atamalar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {displayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={cn('text-sm text-gray-500', typography.caption)}>
Henüz etkinlik yok
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline Line */}
                {index < displayEvents.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200 -z-10" />
                )}

                {/* Event Card */}
                <div
                  onClick={() => onEventClick?.(event)}
                  className={cn(
                    'flex gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                    getEventColor(event.type),
                    'hover:shadow-md'
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn('text-sm font-semibold text-gray-900', typography.h6)}>
                            {event.title}
                          </h4>
                          {event.aiGenerated && (
                            <Sparkles className="w-3 h-3 text-purple-500" />
                          )}
                        </div>
                        {event.description && (
                          <p className={cn('text-sm text-gray-600', typography.small)}>
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('text-xs text-gray-500', typography.caption)}>
                          {formatTimestamp(event.timestamp)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Detayları Gör</DropdownMenuItem>
                            <DropdownMenuItem>Bağlantıyı Kopyala</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* User */}
                    {event.user && (
                      <div className="flex items-center gap-2 mt-2">
                        {event.user.avatar ? (
                          <img
                            src={event.user.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                            {event.user.initials}
                          </div>
                        )}
                        <span className={cn('text-xs text-gray-500', typography.caption)}>
                          {event.user.name}
                        </span>
                      </div>
                    )}

                    {/* Attachments */}
                    {event.attachments && event.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-xs"
                          >
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expand Button */}
        {expandable && maxEvents && filteredEvents.length > maxEvents && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 mx-auto"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
Daha Az Göster
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {filteredEvents.length - maxEvents} Daha Fazla Göster
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
