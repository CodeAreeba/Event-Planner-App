/**
 * Color constants for the Event Planner App
 * Using a modern, vibrant color palette
 */

export const Colors = {
    // Primary colors
    primary: '#6366F1', // Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // Secondary colors
    secondary: '#EC4899', // Pink
    secondaryDark: '#DB2777',
    secondaryLight: '#F472B6',

    // Accent colors
    accent: '#10B981', // Green
    accentDark: '#059669',
    accentLight: '#34D399',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Background colors
    background: '#FFFFFF',
    backgroundDark: '#F9FAFB',
    backgroundGray: '#F3F4F6',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textWhite: '#FFFFFF',

    // Border colors
    border: '#E5E7EB',
    borderDark: '#D1D5DB',

    // Card colors
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    // Gradient colors
    gradientStart: '#6366F1',
    gradientEnd: '#EC4899',
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Get color with opacity
 */
export const getColorWithOpacity = (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default Colors;
