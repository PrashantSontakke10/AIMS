import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/theme";

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("system"); // "light", "dark", "system"
  const systemScheme = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("app_theme_mode");
        if (saved) {
          setThemeMode(saved);
        }
      } catch (e) {
        console.error("Failed to load theme mode:", e);
      }
    };
    loadTheme();
  }, []);

  const selectThemeMode = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem("app_theme_mode", mode);
    } catch (e) {
      console.error("Failed to save theme mode:", e);
    }
  };

  const getThemeColors = () => {
    const activeScheme = themeMode === "system" ? (systemScheme || "light") : themeMode;
    const schemeColors = Colors[activeScheme] || Colors.light;

    return {
      // Dynamic colors based on active scheme
      background: schemeColors.background,
      text: schemeColors.text,
      backgroundElement: schemeColors.backgroundElement,
      backgroundSelected: schemeColors.backgroundSelected,
      textSecondary: schemeColors.textSecondary,
      
      // UI colors adapted for dark/light themes
      offWhite: activeScheme === "dark" ? "#0F172A" : "#F4F6F9",
      border: activeScheme === "dark" ? "#334155" : "#E2E8F0",
      
      // Brand primary/secondary
      navyPrimary: activeScheme === "dark" ? "#0B192C" : "#0B192C",
      navySecondary: activeScheme === "dark" ? "#1E293B" : "#1E3E62",
      accentBlue: "#008DDA",
      accentLight: activeScheme === "dark" ? "#1E293B" : "#EEF5FF",
      textLight: "#FFFFFF",
      
      // Statuses
      pending: "#F59E0B",
      active: "#10B981",
      blocked: "#EF4444",
      
      // Shadow styles
      cardShadow: activeScheme === "dark" ? {} : Colors.cardShadow,
      
      // Theme state
      isDark: activeScheme === "dark",
      themeMode,
    };
  };

  const colors = getThemeColors();

  return (
    <ThemeContext.Provider value={{ themeMode, selectThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
