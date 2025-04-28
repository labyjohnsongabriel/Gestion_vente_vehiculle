import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";

export const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});
