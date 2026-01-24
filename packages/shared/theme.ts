export const THEME = {
  colors: {
    // Brand Colors
    primary: '#00426B', // Pantone 7694 C / 541 U
    secondary: '#4197CB', // Pantone 7688 C / 7688 U
    tertiary: '#0775AB', // Action Blue

    // Accents
    accent: '#F26178', // Pantone 709 C / 709 U
    beige: '#E0C5AC', // Pantone 4685 C / 4685 U
    yellow: '#F9C311',
    
    // Grays & Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray: '#CFD2D3', // Pantone 427 C / Cool Grey 1 U
    
    // Backgrounds
    background: '#F9FAFB',
    surface: '#FFFFFF',
    bgGray: '#F2F2F3',
    secondaryBg: '#EAEFF2',

    // Text Colors
    text: {
        primary: '#111827',
        secondary: '#4B5563',
        muted: '#9CA3AF',
        white: '#FFFFFF',
        brand: '#00426B'
    },
    
    // Functional
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'Inter, sans-serif'
  }
} as const;
