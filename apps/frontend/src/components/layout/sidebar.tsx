'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Scale,
  Calendar,
  FolderOpen,
  Search,
  ScrollText,
  BarChart3,
  Brain,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  exact?: boolean;
  roles?: string[];
  children?: NavItem[];
}

const items: NavItem[] = [
  { label: 'dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'clients', href: '/clients', icon: Users },
  { label: 'cases', href: '/cases', icon: Scale },
  { label: 'hearings', href: '/hearings', icon: Calendar },
  { label: 'documents', href: '/documents', icon: FolderOpen },
  { label: 'precedentSearch', href: '/precedent-search', icon: Search },
  { label: 'petitions', href: '/petitions', icon: ScrollText },
  {
    label: 'reports',
    icon: BarChart3,
    children: [
      { label: 'hearingSchedule', href: '/reports/hearing-schedule', icon: BarChart3 },
      { label: 'aiAnalysis', href: '/reports/ai-analysis', icon: BarChart3 },
      { label: 'caseStatus', href: '/reports/case-status', icon: BarChart3 },
      { label: 'client', href: '/reports/client', icon: BarChart3 },
      { label: 'finance', href: '/reports/finance', icon: BarChart3 },
      { label: 'task', href: '/reports/task', icon: BarChart3 },
      { label: 'activity', href: '/reports/activity', icon: BarChart3 },
      { label: 'performance', href: '/reports/performance', icon: BarChart3 },
    ],
  },
  {
    label: 'ai',
    icon: Brain,
    children: [
      { label: 'newChat', href: '/ai-workspace', icon: Brain },
      { label: 'chatHistory', href: '/ai/conversations', icon: Brain },
      { label: 'promptLibrary', href: '/ai/prompts', icon: Brain },
    ],
  },
  { label: 'calendar', href: '/calendar', icon: Calendar },
  {
    label: 'financeMenu',
    icon: DollarSign,
    children: [
      { label: 'invoices', href: '/finance/invoices', icon: DollarSign },
      { label: 'payments', href: '/finance/payments', icon: DollarSign },
      { label: 'financeReports', href: '/finance/reports', icon: BarChart3 },
    ],
  },
  { label: 'users', href: '/users', icon: Users },
  { label: 'settings', href: '/settings', icon: Settings },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ ai: true, reports: true, financeMenu: true });

  const userRole = role;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isMenuActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => child.href && isActive(child.href, child.exact));
    }
    return item.href && isActive(item.href, item.exact);
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            LexMind AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          // Role check
          if (item.roles && userRole && !item.roles.includes(userRole)) {
            return null;
          }

          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const active = hasChildren ? isMenuActive(item) : (item.href && isActive(item.href, item.exact));
          const isOpen = openMenus[item.label];

          if (hasChildren) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 w-full ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate flex-1 text-left">{t(item.label)}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && item.children && (
                  <div className="pl-6 space-y-1">
                    {item.children.map((child) => {
                      if (child.roles && userRole && !child.roles.includes(userRole)) {
                        return null;
                      }

                      const ChildIcon = child.icon;
                      const childActive = child.href && isActive(child.href, child.exact);

                      return (
                        <TooltipProvider key={child.href}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={child.href!}
                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                  childActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <ChildIcon size={14} className="shrink-0" />
                                <span className="truncate">{t(child.label)}</span>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[220px] bg-slate-900 text-white">
                              <p>{t(`${child.label}Description`)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <TooltipProvider key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{t(item.label)}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[220px] bg-slate-900 text-white">
                  <p>{t(`${item.label}Description`)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Acar Software
            </p>
            <p className="text-xs text-slate-400">
              İstanbul
            </p>
            <p className="text-xs text-slate-400">
              © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
