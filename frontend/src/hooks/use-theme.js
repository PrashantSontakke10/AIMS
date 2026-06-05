/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useAppTheme } from "../context/ThemeContext";

export function useTheme() {
  try {
    const { colors } = useAppTheme();
    return colors;
  } catch (e) {
    return {};
  }
}
