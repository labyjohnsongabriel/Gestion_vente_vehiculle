import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7367F0",
      light: "#9E95F5",
      dark: "#5A50D1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FF9F43",
      light: "#FFB976",
      dark: "#E08A35",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EA5455",
      light: "#F08182",
      dark: "#CE4A4B",
    },
    warning: {
      main: "#FF9F43",
      light: "#FFB976",
      dark: "#E08A35",
    },
    info: {
      main: "#00CFE8",
      light: "#61E3F7",
      dark: "#00A1B5",
    },
    success: {
      main: "#28C76F",
      light: "#5DDC98",
      dark: "#1F9D57",
    },
    background: {
      default: "#F8F7FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#5E5873",
      secondary: "#6E6B7B",
      disabled: "#B9B9C3",
    },
  },
  typography: {
    fontFamily: [
      "Montserrat",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      letterSpacing: "0.4px",
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "0.6rem 1.5rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px 0 rgba(115, 103, 240, 0.4)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#D8D6DE",
            },
            "&:hover fieldset": {
              borderColor: "#7367F0",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 24px 0 rgba(34, 41, 47, 0.1)",
          backgroundImage: "none",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 44,
          height: 44,
        },
      },
    },
  },
});

export default theme;