'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Scale,
  FolderOpen,
  Brain,
  Calendar,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';

const navigation = [
  {
    name: 'Ana Sayfa',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Müvekkiller',
    href: '/clients',
    icon: Users,
  },
  {
    name: 'Davalar',
    href: '/cases',
    icon: Scale,
  },
  {
    name: 'Duruşmalar',
    href: '/hearings',
    icon: Calendar,
  },
  {
    name: 'Belgeler',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    name: 'İçtihat Arama',
    href: '/precedent-search',
    icon: Search,
  },
  {
    name: 'AI Asistan',
    href: '/ai-workspace',
    icon: Brain,
    children: [
      { name: 'Yeni Sohbet', href: '/ai-workspace' },
      { name: 'Sohbet Geçmişi', href: '/ai/conversations' },
      { name: 'Prompt Kütüphanesi', href: '/ai/prompts' },
    ],
  },
  {
    name: 'Takvim',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Finans',
    href: '/finance',
    icon: DollarSign,
    children: [
      { name: 'Faturalar', href: '/finance/invoices' },
      { name: 'Ödemeler', href: '/finance/payments' },
      { name: 'Raporlar', href: '/finance/reports' },
    ],
  },
  {
    name: 'Ayarlar',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            LexMind AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.children) {
            const isOpen = openMenus[item.name] || false;
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="pl-9 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                          pathname === child.href
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Avukat
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              avukat@lexmind.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
