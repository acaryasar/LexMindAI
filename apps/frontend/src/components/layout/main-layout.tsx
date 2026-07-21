'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { AICopilotPanel } from '@/components/ai-copilot/ai-copilot-panel';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
  showAIPanel?: boolean;
}

export function MainLayout({ children, showAIPanel = false }: MainLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Detect AI panel context based on current route
  const aiPanelContext = useMemo(() => {
    if (!showAIPanel) return null;

    // Extract entity ID from dynamic routes
    if (pathname.startsWith('/clients/') && pathname !== '/clients') {
      const parts = pathname.split('/');
      const entityId = parts[2];
      return { context: 'client' as const, entityId };
    }

    if (pathname.startsWith('/cases/') && pathname !== '/cases') {
      const parts = pathname.split('/');
      const entityId = parts[2];
      return { context: 'case' as const, entityId };
    }

    if (pathname.startsWith('/documents/') && pathname !== '/documents') {
      const parts = pathname.split('/');
      const entityId = parts[2];
      return { context: 'document' as const, entityId };
    }

    if (pathname.startsWith('/hearings/') && pathname !== '/hearings') {
      const parts = pathname.split('/');
      const entityId = parts[2];
      return { context: 'hearing' as const, entityId };
    }

    // Route-based context mapping
    if (pathname === '/dashboard') {
      return { context: 'dashboard' as const, entityId: undefined };
    }

    if (pathname.startsWith('/clients')) {
      return { context: 'client' as const, entityId: undefined };
    }

    if (pathname.startsWith('/cases')) {
      return { context: 'case' as const, entityId: undefined };
    }

    if (pathname.startsWith('/documents')) {
      return { context: 'document' as const, entityId: undefined };
    }

    if (pathname.startsWith('/hearings')) {
      return { context: 'hearing' as const, entityId: undefined };
    }

    if (pathname.startsWith('/legal-research')) {
      return { context: 'dashboard' as const, entityId: undefined };
    }

    // Default to dashboard context for other routes
    return { context: 'dashboard' as const, entityId: undefined };
  }, [pathname, showAIPanel]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Global AI Panel */}
      {showAIPanel && aiPanelContext && (
        <div className="hidden lg:block fixed right-0 top-[64px] h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-80 z-40">
          <AICopilotPanel context={aiPanelContext.context} entityId={aiPanelContext.entityId} />
        </div>
      )}
    </div>
  );
}
