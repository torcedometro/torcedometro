export const theme = {
  colors: {
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    primary: '#0EA5E9', // Sky 500
    primaryPressed: '#0284C7', // Sky 600
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    error: '#EF4444', // Red 500
    inputBg: '#334155', // Slate 700
    inputBorder: '#475569', // Slate 600
    outline: 'rgba(255, 255, 255, 0.1)',
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      marginBottom: 6,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
  },
  animation: {
    scale: 0.98,
    duration: 200,
  },
};
