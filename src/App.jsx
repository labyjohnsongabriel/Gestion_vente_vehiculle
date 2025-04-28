import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TopBar from "./components/layout/Topbar"; 
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
      }}
    >
      <TopBar
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Padding Top pour ne pas cacher sous la TopBar
          px: 3, // Padding horizontal
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: sidebarOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          ml: {
            xs: 0,
            md: sidebarOpen ? "240px" : 0, // Si mobile => margin 0, sinon selon sidebar
          },
          width: {
            xs: "100%",
            md: sidebarOpen ? "calc(100% - 240px)" : "100%",
          },
          overflowX: "hidden",
          minHeight: "100vh",
        }}
      >
        <Dashboard />
      </Box>
    </Box>
  );
}
