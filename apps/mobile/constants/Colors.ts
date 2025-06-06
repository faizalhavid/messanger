const colors = {
  whatsappGreen: '#075E54',
  whatsappTeal: '#25D366',
  whatsappBlue: '#34B7F1',
  whatsappBackgroundLight: '#ECE5DD',
  whatsappBackgroundDark: '#121B22',
  whatsappBubbleLight: '#DCF8C6',
  whatsappBubbleDark: '#2A3942',
  whatsappHeaderLight: '#F6F6F6',
  whatsappHeaderDark: '#1A1C20',
};

const themes = {
  light: {
    text: '#111B21',
    background: colors.whatsappBackgroundLight,
    tint: colors.whatsappGreen,
    tabIconDefault: '#bdbdbd',
    tabIconSelected: colors.whatsappGreen,
    bubble: colors.whatsappBubbleLight,
    accent: colors.whatsappTeal,
    link: colors.whatsappBlue,
  },
  dark: {
    text: '#E9EDEF',
    background: colors.whatsappBackgroundDark,
    tint: colors.whatsappGreen,
    tabIconDefault: '#bdbdbd',
    tabIconSelected: colors.whatsappGreen,
    bubble: colors.whatsappBubbleDark,
    accent: colors.whatsappTeal,
    link: colors.whatsappBlue,
  },
};

export { colors, themes };