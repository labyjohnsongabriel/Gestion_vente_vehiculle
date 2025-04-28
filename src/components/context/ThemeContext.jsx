import React, {
  createContext,
  useMemo,
  useState,
  useContext,
  useEffect,
} from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  responsiveFontSizes,
} from "@mui/material";

// 1. Création du contexte
const ThemeContext = createContext();

// 2. Hook personnalisé pour accéder au thème
export const useCustomTheme = () => useContext(ThemeContext);

// 3. Provider de thème
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Fonction pour alterner le mode de thème
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode); // Sauvegarder le mode dans localStorage
  };

  const theme = useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode,
        primary: { main: mode === "light" ? "#1976d2" : "#90caf9" },
        secondary: { main: mode === "light" ? "#f50057" : "#ff4081" },
        background: {
          default: mode === "light" ? "#f5f5f5" : "#121212",
          paper: mode === "light" ? "#ffffff" : "#1e1e1e",
        },
      },
      typography: {
        fontFamily: "Roboto, sans-serif",
        button: { textTransform: "none" },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: 8 },
          },
        },
      },
    });

    return responsiveFontSizes(baseTheme); // Application des tailles de polices responsives
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Applique les styles de base pour le thème */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
