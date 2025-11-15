// Дизайн-система Yess!Go на основе мудборда
export const baseTheme = {
  fonts: {
    family: '"Inter", "Geologica", sans-serif',
    heading: '"Geologica", "Inter", sans-serif',
  },
  borderRadius: 12,
};

export const partnerTheme = {
  ...baseTheme,
  colors: {
    // Цвета согласно Moodboard
    primary: '#689071',           // Medium green
    primaryDark: '#375534',       // Dark green
    primaryVeryDark: '#0F2A1D',   // Very dark green
    primaryLight: '#AEC380',      // Light green
    primaryPale: '#E3EED4',       // Very light green/off-white
    accent: '#AEC380',
    bgGradient: 'linear-gradient(135deg, #0F2A1D 0%, #375534 25%, #689071 50%, #AEC380 75%, #E3EED4 100%)',
    cardBg: '#E3EED420',
    textHeader: '#0F2A1D',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    text: {
      primary: '#0F2A1D',
      secondary: '#689071',
      disabled: '#bfbfbf',
    },
    background: {
      primary: '#E3EED4',
      secondary: '#AEC380',
      card: '#ffffff',
      accent: '#E3EED4',
    },
    border: {
      base: '#AEC380',
    },
  }
};

export default partnerTheme;
