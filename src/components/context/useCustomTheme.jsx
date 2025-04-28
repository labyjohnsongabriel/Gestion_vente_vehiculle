import { createContext, useContext, useState } from "react";
// Créez un contexte pour gérer le thème
const ThemeContext = createContext();

// Créez un hook pour utiliser le contexte
export const useCustomTheme = () => {
  return useContext(ThemeContext);
};

// Créez le fournisseur pour englober les composants nécessitant le contexte
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light"); // Valeur par défaut : mode clair

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
