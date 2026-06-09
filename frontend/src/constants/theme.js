import { Platform } from "react-native";

const shadowStyle = Platform.select({
  web: {
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  },
  default: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export const Colors = {
  // Nested structure for standard Expo components
  light: {
    text: "#0B192C", // Deep Dark Navy
    background: "#FFFFFF", // White
    backgroundElement: "#F4F6F9", // Muted Gray
    backgroundSelected: "#EEF5FF", // Light Blue highlight
    textSecondary: "#64748B", // Muted Slate
  },
  dark: {
    text: "#FFFFFF",
    background: "#0B192C",
    backgroundElement: "#1E3E62",
    backgroundSelected: "#008DDA",
    textSecondary: "#B0B4BA",
  },

  // Flat properties for custom admin panel pages
  navyPrimary: "#1A5075", // Slate Teal Blue (matching screenshot)
  navySecondary: "#2C5E8A", // Medium Slate Teal
  accentBlue: "#008DDA", // Electric Blue
  accentLight: "#EEF5FF", // Light Blue tint
  background: "#FFFFFF", // White
  offWhite: "#F4F6F9", // Light off-white
  text: "#0B192C", // Navy text
  textSecondary: "#64748B", // Slate text
  textLight: "#FFFFFF", // White text
  border: "#E2E8F0", // Border gray
  pending: "#F59E0B", // Orange
  active: "#10B981", // Green
  blocked: "#EF4444", // Red
  cardShadow: shadowStyle,

  // Solid bright colors for My Subjects grid tiles matching screenshot
  subjectColors: [
    "#FF4B72", // Pink/Rose
    "#4CAF50", // Green
    "#9C27B0", // Purple
    "#7E57C2", // Lavender
    "#00BCD4", // Cyan
    "#E91E63", // Magenta
    "#FF9800", // Orange
  ],
};

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const CardShadow = shadowStyle;
