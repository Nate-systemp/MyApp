/**
 * Yin App — iOS-native Light Design System
 * Primary: Forest Green #0B6E4F
 */

export const C = {
  // Brand — Forest Green
  green:        '#0B6E4F',
  greenLight:   '#0D8A63',
  greenDark:    '#084D37',
  greenTint:    '#E8F5F0',  // very light green tint for backgrounds
  greenMuted:   '#5BA48A',  // muted for secondary text

  // iOS system colours
  bg:           '#FFFFFF',
  bgSecondary:  '#F2F2F7',
  bgTertiary:   '#E5E5EA',
  fill:         '#F2F2F7',

  // Text
  label:        '#1C1C1E',
  label2:       '#3A3A3C',
  label3:       '#636366',
  label4:       '#AEAEB2',
  placeholder:  '#C7C7CC',

  // Separator / Border
  sep:          '#E5E5EA',
  sepStrong:    '#D1D1D6',

  // States
  success:      '#34C759',
  error:        '#FF3B30',
  warning:      '#FF9500',
};

export const F = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 28,
  hero:48,

  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  heavy:   '800',
  black:   '900',
};

export const S = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const R = {
  sm:    6,
  md:   10,
  lg:   14,
  xl:   20,
  xxl:  28,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
