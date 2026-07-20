/**
 * LexMind AI Design System
 * Enterprise-grade design tokens and standards
 * Inspired by Apple, Microsoft, Stripe, Notion, Linear
 */

// ==================== SPACING SYSTEM ====================
export const spacing = {
  1: 4,   // 4px
  2: 8,   // 8px
  3: 12,  // 12px
  4: 16,  // 16px
  5: 24,  // 24px
  6: 32,  // 32px
  7: 48,  // 48px
  8: 64,  // 64px
} as const;

// ==================== CORNER RADIUS ====================
export const borderRadius = {
  card: 16,
  input: 12,
  button: 12,
  dialog: 20,
  small: 8,
  large: 24,
} as const;

// ==================== ELEVATION LEVELS ====================
export const elevation = {
  background: 'bg-white',
  surface: 'bg-gray-50',
  card: 'bg-white shadow-sm',
  modal: 'bg-white shadow-xl',
  floating: 'bg-white shadow-2xl',
} as const;

// ==================== ANIMATIONS ====================
export const animations = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
  subtle: 'duration-200 ease-in-out',
  natural: 'duration-300 ease-out',
} as const;

// ==================== COLORS ====================
export const colors = {
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
  // Accent purple (#5B4BFF)
  accent: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#5B4BFF',
    600: '#4c3ae6',
    700: '#3d2ecc',
    800: '#2e22b3',
    900: '#1f1899',
    950: '#0f0c4d',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
} as const;

// ==================== TYPOGRAPHY ====================
export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold tracking-tight',
  h5: 'text-lg font-medium tracking-tight',
  h6: 'text-base font-medium tracking-tight',
  body: 'text-base text-gray-700',
  small: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
} as const;

// ==================== PRIORITY LEVELS ====================
export const priority: Record<string, { color: string; bg: string; border: string; badge: string }> = {
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  medium: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  low: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
};

// ==================== STATUS LEVELS ====================
export const status: Record<string, { color: string; bg: string; border: string; dot: string; badge?: string }> = {
  active: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  pending: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  completed: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  cancelled: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  archived: {
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

// ==================== GLASSMORPHISM ====================
export const glassmorphism = {
  light: 'bg-white/80 backdrop-blur-xl border border-white/20',
  dark: 'bg-gray-900/80 backdrop-blur-xl border border-gray-700/20',
  purple: 'bg-purple-500/10 backdrop-blur-xl border border-purple-200/50',
} as const;

// ==================== SHADOWS ====================
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  purple: 'shadow-purple-100/50',
  glow: 'shadow-lg shadow-purple-500/20',
} as const;

// ==================== COMPONENT STATES ====================
export const states = {
  hover: 'hover:bg-gray-50 hover:border-gray-300',
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
  active: 'active:bg-gray-100',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
  loading: 'animate-pulse',
} as const;

// ==================== CONFIDENCE SCORE ====================
export const getConfidenceColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 70) return 'text-blue-600 bg-blue-50';
  if (score >= 50) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

// ==================== RISK LEVEL ====================
export const getRiskColor = (level: 'low' | 'medium' | 'high' | 'critical') => {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// ==================== SUCCESS PROBABILITY ====================
export const getSuccessProbabilityColor = (probability: number) => {
  if (probability >= 80) return 'text-green-600';
  if (probability >= 60) return 'text-blue-600';
  if (probability >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

// ==================== ACTIVITY LEVEL ====================
export const getActivityLevelColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-blue-600 bg-blue-50';
    case 'low':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// ==================== RELATIONSHIP SCORE ====================
export const getRelationshipScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};
