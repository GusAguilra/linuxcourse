export const tokens = {
  colors: {
    bg: {
      primary: '#09090b',
      secondary: '#0d1117',
      tertiary: '#15171c',
      overlay: 'rgba(0,0,0,0.6)',
      card: '#0d1117',
      cardHover: '#111827',
    },
    border: {
      subtle: '#1f2230',
      default: '#27272a',
      strong: '#3f3f46',
      focus: '#22c55e',
    },
    fg: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
      inverse: '#09090b',
      subtle: '#52525b',
    },
    brand: {
      500: '#22c55e',
      400: '#4ade80',
      600: '#16a34a',
      700: '#15803d',
      glow: 'rgba(34,197,94,0.15)',
      glowStrong: 'rgba(34,197,94,0.25)',
    },
    accent: {
      amber: '#f59e0b',
      blue: '#3b82f6',
      rose: '#f43f5e',
      cyan: '#06b6d4',
      purple: '#a855f7',
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 8px 32px rgba(0,0,0,0.4)',
    xl: '0 16px 48px rgba(0,0,0,0.5)',
    glow: '0 0 24px rgba(34,197,94,0.12)',
    glowStrong: '0 0 0 0 40px rgba(34,197,94,0.2)',
    inner: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  },
  spacing: {
    0: 0,
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  transition: {
    fast: '120ms ease-out',
    base: '180ms ease-out',
    slow: '280ms ease-out',
    spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  fontSize: {
    xs: '0.7rem',
    sm: '0.8125rem',
    base: '0.925rem',
    lg: '1.05rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
    '5xl': '3.5rem',
  },
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },
} as const;

export type Tokens = typeof tokens;

export function cssVar(name: string): string {
  return `var(--${name})`;
}

export function token<T extends keyof Tokens>(category: T, ...path: string[]): string {
  let value: unknown = tokens[category];
  for (const key of path) {
    value = (value as Record<string, unknown>)[key];
  }
  return String(value);
}