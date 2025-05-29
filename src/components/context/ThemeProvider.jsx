import React, { useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { useSettings } from "./SettingsContext";
import { frFR, enUS } from "@mui/material/locale";

const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();

  const theme = useMemo(() => {
    const baseTheme = createTheme(
      {
        palette: {
          mode: settings.themeMode,
          primary: {
            main: "#3f51b5",
          },
          secondary: {
            main: "#f50057",
          },
        },
        typography: {
          fontSize:
            settings.fontSize === "small"
              ? 12
              : settings.fontSize === "large"
              ? 16
              : 14,
        },
        components: {
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
          },
        },
      },
      settings.language === "fr" ? frFR : enUS
    );

    if (settings.accessibility.highContrast) {
      baseTheme.palette.contrastThreshold = 4.5;
      baseTheme.palette.tonalOffset = 0.2;
    }

    return baseTheme;
  }, [settings]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
