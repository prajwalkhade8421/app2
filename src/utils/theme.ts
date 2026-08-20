import { ThemeAccentColor } from '../types';

export interface AccentThemeConfig {
  id: ThemeAccentColor;
  label: string;
  hex: string;
  hexDark: string;
  text: string;
  textLight: string;
  bg: string;
  bgSubtle: string;
  border: string;
  borderSubtle: string;
  ring: string;
  button: string;
  buttonHover: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
}

export const ACCENT_THEMES: Record<ThemeAccentColor, AccentThemeConfig> = {
  amber: {
    id: 'amber',
    label: 'Warm Amber',
    hex: '#F59E0B',
    hexDark: '#B45309',
    text: 'text-amber-400',
    textLight: 'text-amber-300',
    bg: 'bg-amber-500',
    bgSubtle: 'bg-amber-950/30',
    border: 'border-amber-500/50',
    borderSubtle: 'border-amber-900/30',
    ring: 'ring-amber-500/40',
    button: 'bg-amber-500 hover:bg-amber-400 text-neutral-950',
    buttonHover: 'hover:bg-amber-400',
    glow: 'shadow-amber-500/20',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-amber-400',
  },
  cyan: {
    id: 'cyan',
    label: 'Electric Cyan',
    hex: '#06B6D4',
    hexDark: '#0E7490',
    text: 'text-cyan-400',
    textLight: 'text-cyan-300',
    bg: 'bg-cyan-500',
    bgSubtle: 'bg-cyan-950/30',
    border: 'border-cyan-500/50',
    borderSubtle: 'border-cyan-900/30',
    ring: 'ring-cyan-500/40',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950',
    buttonHover: 'hover:bg-cyan-400',
    glow: 'shadow-cyan-500/20',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-cyan-400',
  },
  emerald: {
    id: 'emerald',
    label: 'Zen Emerald',
    hex: '#10B981',
    hexDark: '#047857',
    text: 'text-emerald-400',
    textLight: 'text-emerald-300',
    bg: 'bg-emerald-500',
    bgSubtle: 'bg-emerald-950/30',
    border: 'border-emerald-500/50',
    borderSubtle: 'border-emerald-900/30',
    ring: 'ring-emerald-500/40',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950',
    buttonHover: 'hover:bg-emerald-400',
    glow: 'shadow-emerald-500/20',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-emerald-400',
  },
  blue: {
    id: 'blue',
    label: 'Focus Blue',
    hex: '#3B82F6',
    hexDark: '#1D4ED8',
    text: 'text-blue-400',
    textLight: 'text-blue-300',
    bg: 'bg-blue-500',
    bgSubtle: 'bg-blue-950/30',
    border: 'border-blue-500/50',
    borderSubtle: 'border-blue-900/30',
    ring: 'ring-blue-500/40',
    button: 'bg-blue-500 hover:bg-blue-400 text-neutral-950',
    buttonHover: 'hover:bg-blue-400',
    glow: 'shadow-blue-500/20',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-blue-400',
  },
  violet: {
    id: 'violet',
    label: 'Deep Violet',
    hex: '#8B5CF6',
    hexDark: '#6D28D9',
    text: 'text-violet-400',
    textLight: 'text-violet-300',
    bg: 'bg-violet-500',
    bgSubtle: 'bg-violet-950/30',
    border: 'border-violet-500/50',
    borderSubtle: 'border-violet-900/30',
    ring: 'ring-violet-500/40',
    button: 'bg-violet-500 hover:bg-violet-400 text-neutral-950',
    buttonHover: 'hover:bg-violet-400',
    glow: 'shadow-violet-500/20',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-violet-400',
  },
  rose: {
    id: 'rose',
    label: 'Crimson Rose',
    hex: '#F43F5E',
    hexDark: '#BE123C',
    text: 'text-rose-400',
    textLight: 'text-rose-300',
    bg: 'bg-rose-500',
    bgSubtle: 'bg-rose-950/30',
    border: 'border-rose-500/50',
    borderSubtle: 'border-rose-900/30',
    ring: 'ring-rose-500/40',
    button: 'bg-rose-500 hover:bg-rose-400 text-neutral-950',
    buttonHover: 'hover:bg-rose-400',
    glow: 'shadow-rose-500/20',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-rose-400',
  },
  zinc: {
    id: 'zinc',
    label: 'Minimal Monochrome',
    hex: '#E4E4E7',
    hexDark: '#71717A',
    text: 'text-neutral-100',
    textLight: 'text-neutral-200',
    bg: 'bg-neutral-100',
    bgSubtle: 'bg-neutral-800/40',
    border: 'border-neutral-400/50',
    borderSubtle: 'border-neutral-800/40',
    ring: 'ring-neutral-400/40',
    button: 'bg-neutral-100 hover:bg-white text-neutral-950',
    buttonHover: 'hover:bg-white',
    glow: 'shadow-neutral-500/20',
    gradientFrom: 'from-neutral-300',
    gradientTo: 'to-neutral-100',
  },
};

export const getThemeConfig = (color?: ThemeAccentColor): AccentThemeConfig => {
  return ACCENT_THEMES[color || 'amber'] || ACCENT_THEMES.amber;
};

export const applyThemeToDocument = (color: ThemeAccentColor) => {
  const theme = getThemeConfig(color);
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--color-accent-primary', theme.hex);
    document.documentElement.style.setProperty('--color-accent-dark', theme.hexDark);
  }
};
