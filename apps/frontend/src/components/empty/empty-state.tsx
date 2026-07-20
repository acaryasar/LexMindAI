'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileText, Users, Calendar, Scale, Search, Sparkles, 
  Plus, ArrowRight, Lightbulb, CheckCircle
} from 'lucide-react';
import { spacing, borderRadius, typography } from '@/lib/design-system';

export interface EmptyStateProps {
  // Content
  title: string;
  description: string;
  icon?: React.ReactNode;

  // Type-specific content
  type?: 'cases' | 'clients' | 'documents' | 'calendar' | 'tasks' | 'search' | 'general';

  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  // AI Help
  showAIHelp?: boolean;
  onAIHelp?: () => void;

  // Educational Content
  educationalContent?: {
    whatItDoes: string;
    whyItMatters: string;
    howToStart: string;
  };

  // Styling
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  type = 'general',
  primaryAction,
  secondaryAction,
  showAIHelp = true,
  onAIHelp,
  educationalContent,
  className,
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'cases':
        return <Scale className="w-16 h-16 text-gray-300" />;
      case 'clients':
        return <Users className="w-16 h-16 text-gray-300" />;
      case 'documents':
        return <FileText className="w-16 h-16 text-gray-300" />;
      case 'calendar':
        return <Calendar className="w-16 h-16 text-gray-300" />;
      case 'tasks':
        return <CheckCircle className="w-16 h-16 text-gray-300" />;
      case 'search':
        return <Search className="w-16 h-16 text-gray-300" />;
      default:
        return <FileText className="w-16 h-16 text-gray-300" />;
    }
  };

  const getEducationalContent = () => {
    if (educationalContent) return educationalContent;

    switch (type) {
      case 'cases':
        return {
          whatItDoes: 'Manage your legal cases, track progress, and organize case-related documents.',
          whyItMatters: 'Centralized case management improves organization and ensures nothing falls through the cracks.',
          howToStart: 'Create your first case to begin tracking legal matters and associated documents.',
        };
      case 'clients':
        return {
          whatItDoes: 'Maintain client relationships, track communications, and manage client-related cases.',
          whyItMatters: 'Strong client relationships are the foundation of successful legal practice.',
          howToStart: 'Add your first client to start building your client database.',
        };
      case 'documents':
        return {
          whatItDoes: 'Store, organize, and analyze legal documents with AI-powered insights.',
          whyItMatters: 'Efficient document management saves time and improves case preparation.',
          howToStart: 'Upload your first document to leverage AI analysis and organization.',
        };
      case 'calendar':
        return {
          whatItDoes: 'Duruşmaları, toplantıları, son teslim tarihlerini ve önemli yasal tarihleri planlayın.',
          whyItMatters: 'Takvim yönetimi, kritik son teslim tarihlerini ve duruşma tarihlerini asla kaçırmamanızı sağlar.',
          howToStart: 'İlk etkinliğinizi ekleyerek yasal takviminizi takip etmeye başlayın.',
        };
      case 'tasks':
        return {
          whatItDoes: 'Davalar ve müşteri işleriyle ilgili görevleri oluşturun, atayın ve takip edin.',
          whyItMatters: 'Görev yönetimi verimliliği artırır ve hesap verilebilirliği sağlar.',
          howToStart: 'İlk görevinizi oluşturarak iş yükünüzü düzenlemeye başlayın.',
        };
      case 'search':
        return {
          whatItDoes: 'Davalar, müşteriler, belgeler ve diğer yasal veriler arasında arama yapın.',
          whyItMatters: 'Güçlü arama, ihtiyaç duyduğunuzda bilgiyi hızlıca bulmanıza yardımcı olur.',
          howToStart: 'İlgili bilgiyi bulmak için yukarıdaki arama sorgunuzu yazın.',
        };
      default:
        return {
          whatItDoes: 'Bu bölüm önemli yasal bilgileri yönetmenize yardımcı olur.',
          whyItMatters: 'Organize edilmiş veriler verimliliği ve karar vermeyi iyileştirir.',
          howToStart: 'İlk öğenizi oluşturarak başlayın.',
        };
    }
  };

  const content = getEducationalContent();

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6', className)}>
      {/* Icon */}
      <div className="mb-6">
        {icon || getDefaultIcon()}
      </div>

      {/* Title & Description */}
      <div className="text-center max-w-md mb-8">
        <h3 className={cn('text-xl font-semibold text-gray-900 mb-2', typography.h3)}>
          {title}
        </h3>
        <p className={cn('text-sm text-gray-500', typography.small)}>
          {description}
        </p>
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mb-8">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {primaryAction.icon || <Plus className="w-4 h-4" />}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* AI Help */}
      {showAIHelp && onAIHelp && (
        <div className="w-full max-w-md mb-8">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className={cn('text-sm font-medium text-gray-900 mb-1', typography.h6)}>
                  AI Size Başlamanıza Yardım Etsin
                </p>
                <p className={cn('text-sm text-gray-600 mb-3', typography.small)}>
                  AI kurulum sürecinde size rehberlik edebilir ve en iyi uygulamaları önerebilir.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAIHelp}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  AI Rehberliği Al
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="w-full max-w-md">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className={cn('text-sm font-semibold text-gray-900 mb-4', typography.h6)}>
            Bu Bölümü Anlama
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className={cn('text-sm font-medium text-gray-700', typography.small)}>
                  Ne Yapar
                </span>
              </div>
              <p className={cn('text-xs text-gray-600 pl-4', typography.caption)}>
                {content.whatItDoes}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className={cn('text-sm font-medium text-gray-700', typography.small)}>
                  Neden Önemli
                </span>
              </div>
              <p className={cn('text-xs text-gray-600 pl-4', typography.caption)}>
                {content.whyItMatters}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className={cn('text-sm font-medium text-gray-700', typography.small)}>
                  Nasıl Başlanır
                </span>
              </div>
              <p className={cn('text-xs text-gray-600 pl-4', typography.caption)}>
                {content.howToStart}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
