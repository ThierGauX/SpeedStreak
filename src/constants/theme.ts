// src/constants/theme.ts
export const sharedColors = {
  accent:       '#00c3ff',
  orange:       '#ff6400',
  gold:         '#ffc700',
  green:        '#00ff88',
  red:          '#ff4444',
  white:        '#ffffff',
  black:        '#000000',
};

export const darkTheme = {
  ...sharedColors,
  bg:           '#08090e',
  bgCard:       'rgba(255,255,255,0.04)',
  bgCardBorder: 'rgba(255,255,255,0.07)',
  accentDim:    'rgba(0,195,255,0.12)',
  accentBorder: 'rgba(0,195,255,0.25)',
  orangeDim:    'rgba(255,100,0,0.12)',
  orangeBorder: 'rgba(255,100,0,0.25)',
  goldDim:      'rgba(255,199,0,0.10)',
  goldBorder:   'rgba(255,199,0,0.25)',
  text:         '#ffffff',
  textMuted:    '#4a6a8a',
  textDim:      '#2a3a4a',
  navBg:        'rgba(8,9,14,0.97)',
  navBorder:    'rgba(255,255,255,0.07)',
  modalBg:      '#0d1117',
  modalOverlay: 'rgba(0,0,0,0.85)',
};

export const lightTheme = {
  ...sharedColors,
  bg:           '#f4f6fc',
  bgCard:       '#ffffff',
  bgCardBorder: 'rgba(0,0,0,0.06)',
  accentDim:    'rgba(0,195,255,0.15)',
  accentBorder: 'rgba(0,195,255,0.4)',
  orangeDim:    'rgba(255,100,0,0.12)',
  orangeBorder: 'rgba(255,100,0,0.3)',
  goldDim:      'rgba(255,199,0,0.15)',
  goldBorder:   'rgba(255,199,0,0.4)',
  text:         '#1e293b',
  textMuted:    '#64748b',
  textDim:      '#94a3b8',
  navBg:        'rgba(255,255,255,0.97)',
  navBorder:    'rgba(0,0,0,0.08)',
  modalBg:      '#ffffff',
  modalOverlay: 'rgba(0,0,0,0.45)',
};

export type ThemeColors = typeof darkTheme;
