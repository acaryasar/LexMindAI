'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  onShortcutTriggered,
}: KeyboardShortcutsProps) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

    const matchedShortcut = shortcutsRef.current.find((shortcut) => {
      return (
        shortcut.key.toLowerCase() === key.toLowerCase() &&
        (shortcut.ctrl === undefined || shortcut.ctrl === ctrlKey) &&
        (shortcut.shift === undefined || shortcut.shift === shiftKey) &&
        (shortcut.alt === undefined || shortcut.alt === altKey) &&
        (shortcut.meta === undefined || shortcut.meta === metaKey)
      );
    });

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        e.preventDefault();
      }
      
      matchedShortcut.action();
      onShortcutTriggered?.(matchedShortcut);
    }
  }, [enabled, onShortcutTriggered]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsHelp({
  shortcuts,
  className,
}: {
  shortcuts: KeyboardShortcut[];
  className?: string;
}) {
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts: string[] = [];
    
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.meta) parts.push('Cmd');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  const groupShortcuts = () => {
    const groups: Record<string, KeyboardShortcut[]> = {
      navigation: [],
      actions: [],
      ai: [],
      editing: [],
      general: [],
    };

    shortcuts.forEach((shortcut) => {
      const key = shortcut.key.toLowerCase();
      
      if (['k', '/'].includes(key)) {
        groups.navigation.push(shortcut);
      } else if (['n', 'c', 'd', 't', 'f', 's'].includes(key)) {
        groups.actions.push(shortcut);
      } else if (['a', 'g'].includes(key)) {
        groups.ai.push(shortcut);
      } else if (['z', 'y', 's', 'f'].includes(key)) {
        groups.editing.push(shortcut);
      } else {
        groups.general.push(shortcut);
      }
    });

    return groups;
  };

  const grouped = groupShortcuts();

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Klavye Kısayolları</h3>
      
      <div className="space-y-4">
        {/* Navigation */}
        {grouped.navigation.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
Navigasyon
            </h4>
            <div className="space-y-2">
              {grouped.navigation.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {grouped.actions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
Hızlı İşlemler
            </h4>
            <div className="space-y-2">
              {grouped.actions.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI */}
        {grouped.ai.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
AI Özellikleri
            </h4>
            <div className="space-y-2">
              {grouped.ai.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editing */}
        {grouped.editing.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
Düzenleme
            </h4>
            <div className="space-y-2">
              {grouped.editing.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General */}
        {grouped.general.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
Genel
            </h4>
            <div className="space-y-2">
              {grouped.general.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-200">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default shortcuts for the application
export const defaultShortcuts: KeyboardShortcut[] = [
  // Command Palette
  {
    key: 'k',
    ctrl: true,
    meta: true,
    description: 'Open command palette',
    action: () => console.log('Open command palette'),
  },
  {
    key: '/',
    description: 'Open search',
    action: () => console.log('Open search'),
  },

  // Navigation
  {
    key: 'g',
    shift: true,
    description: 'Go to...',
    action: () => console.log('Go to'),
  },

  // Quick Actions
  {
    key: 'n',
    description: 'Create new item',
    action: () => console.log('Create new'),
  },
  {
    key: 'c',
    description: 'Create case',
    action: () => console.log('Create case'),
  },
  {
    key: 'd',
    description: 'Create document',
    action: () => console.log('Create document'),
  },
  {
    key: 't',
    description: 'Create task',
    action: () => console.log('Create task'),
  },
  {
    key: 'f',
    description: 'Focus search',
    action: () => console.log('Focus search'),
  },

  // AI Features
  {
    key: 'a',
    description: 'Ask AI',
    action: () => console.log('Ask AI'),
  },
  {
    key: 'g',
    description: 'Generate with AI',
    action: () => console.log('Generate with AI'),
  },

  // Editing
  {
    key: 'z',
    ctrl: true,
    description: 'Undo',
    action: () => console.log('Undo'),
  },
  {
    key: 'y',
    ctrl: true,
    description: 'Redo',
    action: () => console.log('Redo'),
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save',
    action: () => console.log('Save'),
  },

  // General
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    action: () => console.log('Show shortcuts'),
  },
  {
    key: 'Escape',
    description: 'Close modal / cancel',
    action: () => console.log('Escape'),
  },
];
