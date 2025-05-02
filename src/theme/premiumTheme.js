import { createTheme } from "@mui/material/styles";

const premiumTheme = createTheme({
  palette: {
    primary: {
      main: "#667eea", // Couleur principale
    },
    secondary: {
      main: "#764ba2", // Couleur secondaire
    },
    background: {
      default: "#f9f9f9", // Fond clair
      paper: "#ffffff", // Fond des cartes
    },
    text: {
      primary: "#3a4b6d", // Texte principal
      secondary: "#667eea", // Texte secondaire
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    body1: {
      fontSize: "1rem",
      color: "#3a4b6d",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: 500,
          padding: "8px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default premiumTheme;
