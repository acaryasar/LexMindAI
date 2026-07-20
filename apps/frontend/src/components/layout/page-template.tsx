'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { spacing, borderRadius, typography, glassmorphism } from '@/lib/design-system';

interface PageTemplateProps {
  // Page Identity
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  organization?: string;

  // Primary KPI Area
  kpiArea?: ReactNode;
  warnings?: ReactNode;
  deadlines?: ReactNode;
  businessMetrics?: ReactNode;

  // Primary Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;

  // Search & Filters
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: ReactNode;

  // Main Content
  children: ReactNode;

  // Activity Timeline
  showActivityTimeline?: boolean;
  activityTimeline?: ReactNode;

  // Additional Options
  className?: string;
}

export function PageTemplate({
  title,
  subtitle,
  breadcrumb,
  organization,
  kpiArea,
  warnings,
  deadlines,
  businessMetrics,
  primaryAction,
  secondaryActions,
  showSearch = true,
  searchPlaceholder = 'Ara...',
  onSearch,
  filters,
  children,
  showActivityTimeline = true,
  activityTimeline,
  className,
}: PageTemplateProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Page Identity Section */}
      <div className={cn('bg-white border-b border-gray-200', glassmorphism.light)}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {/* Organization */}
          {organization && (
            <p className={cn('text-sm text-gray-500 mb-2', typography.caption)}>
              {organization}
            </p>
          )}

          {/* Title */}
          <h1 className={cn('text-4xl font-bold text-gray-900 tracking-tight mb-2', typography.h1)}>
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className={cn('text-lg text-gray-600', typography.body)}>
              {subtitle}
            </p>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <div className="flex items-center gap-3">
              {/* Primary Action */}
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium rounded-xl',
                    'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                    'hover:from-purple-600 hover:to-purple-700',
                    'shadow-md shadow-purple-200',
                    'flex items-center gap-2'
                  )}
                >
                  {primaryAction.icon && primaryAction.icon}
                  {primaryAction.label}
                </Button>
              )}

              {/* Secondary Actions */}
              {secondaryActions && secondaryActions.length > 0 && (
                <div className="flex items-center gap-2">
                  {secondaryActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant="outline"
                      className={cn(
                        'px-4 py-2.5 text-sm font-medium rounded-xl',
                        'border-gray-200 hover:bg-gray-50',
                        'flex items-center gap-2'
                      )}
                    >
                      {action.icon && action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className={cn(
                      'pl-10 pr-4 py-2.5 text-sm rounded-xl',
                      'border-gray-200 focus:border-purple-500',
                      'w-64'
                    )}
                  />
                </div>
              )}

              {filters && <div className="flex items-center gap-2">{filters}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Area */}
      {(kpiArea || warnings || deadlines || businessMetrics) && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiArea && <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">{kpiArea}</div>}
            {warnings && <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">{warnings}</div>}
            {deadlines && <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">{deadlines}</div>}
            {businessMetrics && <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">{businessMetrics}</div>}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Primary Workspace */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Activity Timeline */}
          {showActivityTimeline && activityTimeline && (
            <div className="w-80 hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h3 className={cn('text-lg font-semibold text-gray-900 mb-4', typography.h4)}>
                  Etkinlik Zaman Çizelgesi
                </h3>
                {activityTimeline}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
