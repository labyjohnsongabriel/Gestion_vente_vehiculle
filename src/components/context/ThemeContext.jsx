import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";

const ThemeContext = createContext();

// Fournisseur de thème et hook d’utilisation
export const ThemeProviderCustom = ({ children }) => {
  // Ajout de la persistance du thème
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light");

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleTheme = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: { default: "#181818", paper: "#232323" },
                text: { primary: "#fff", secondary: "#bdbdbd" },
              }
            : {}),
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => useContext(ThemeContext);
