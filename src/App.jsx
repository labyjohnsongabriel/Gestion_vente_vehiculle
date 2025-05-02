import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import {
  ThemeProvider as MuiThemeProvider,
  useTheme,
} from "@mui/material/styles";
import { Routes, Route } from "react-router-dom";

import TopBar from "./components/layout/Topbar";
import { Sidebar } from "./components/layout/Sidebar";
import { UserProvider } from "./components/context/UserContext";
import { SidebarProvider } from "./components/context/SidebarContext";
import premiumTheme from "./theme/premiumTheme";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Account from "./pages/Account";
import ErrorBoundary from "./pages/ErrorBoundary";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";
import ClientList from "./pages/Clients/ClientList";
import FournisseurList from "./pages/Fournisseurs/FournisseurList";
import PieceList from "./pages/Pieces/PieceList";
import CategoryList from "./pages/Categories/CategoryList";
import CommandeList from "./pages/Commandes/CommandeList";
import FactureList from "./pages/Factures/FactureList";
import StockList from "./pages/Stocks/StockList";
import VehiculeList from "./pages/Vehicules/VehiculeList";
import PieceVehiculeList from "./pages/PieceVehicule/PieceVehiculeList";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import SalesChart from "./components/charts/SalesChart";
import AdminPanel from "./components/Dashboard/AdminPanel";
import UserProfile from "./components/Dashboard/UserProfile";

const AppLayout = ({ children, sidebarOpen, isMobile }) => (
  <Box
    sx={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      overflowX: "hidden",
    }}
  >
    <TopBar />
    <Sidebar isMobile={isMobile} open={sidebarOpen} />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: 8,
        px: 3,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: sidebarOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
        ml: { xs: 0, md: sidebarOpen ? "20px" : 0 },
        width: { xs: "100%", md: sidebarOpen ? "calc(100% - 240px)" : "100%" },
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      {children}
    </Box>
  </Box>
);

const RouteWithErrorBoundary = ({ element }) => (
  <ErrorBoundary>{element}</ErrorBoundary>
);

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <MuiThemeProvider theme={premiumTheme}>
      <UserProvider>
        <SidebarProvider value={{ sidebarOpen, toggleSidebar }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected layout */}
            <Route
              path="/*"
              element={
                <AppLayout sidebarOpen={sidebarOpen} isMobile={isMobile}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <RouteWithErrorBoundary element={<Dashboard />} />
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <RouteWithErrorBoundary element={<Dashboard />} />
                      }
                    />
    
                    <Route
                      path="/admin"
                      element={
                        <RouteWithErrorBoundary element={<AdminPanel />} />
                      }
                      />
                    <Route
                      path="/statistics"
                      element={
                        <RouteWithErrorBoundary element={<SalesChart />} />
                      }
                    />
                    <Route
                      path="/user"
                      element={
                        <RouteWithErrorBoundary element={<UserProfile />} />
                      }
                      />
                    <Route
                      path="/settings"
                      element={
                        <RouteWithErrorBoundary element={<Settings />} />
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <RouteWithErrorBoundary element={<ProfilePage />} />
                      }
                    />
                    <Route
                      path="/categorie"
                      element={
                        <RouteWithErrorBoundary element={<CategoryList />} />
                      }
                    />
                    <Route
                      path="/customers"
                      element={
                        <RouteWithErrorBoundary element={<Customers />} />
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <RouteWithErrorBoundary element={<Inventory />} />
                      }
                    />
                    <Route
                      path="/account"
                      element={<RouteWithErrorBoundary element={<Account />} />}
                    />
                    <Route
                      path="/feedback"
                      element={
                        <RouteWithErrorBoundary element={<Feedback />} />
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <RouteWithErrorBoundary element={<ClientList />} />
                      }
                    />
                    <Route
                      path="/fournisseurs"
                      element={
                        <RouteWithErrorBoundary element={<FournisseurList />} />
                      }
                    />
                    <Route
                      path="/pieces"
                      element={
                        <RouteWithErrorBoundary element={<PieceList />} />
                      }
                    />
                    <Route
                      path="/categories-piece"
                      element={
                        <RouteWithErrorBoundary element={<CategoryList />} />
                      }
                    />
                    <Route
                      path="/commandes"
                      element={
                        <RouteWithErrorBoundary element={<CommandeList />} />
                      }
                    />
                    <Route
                      path="/factures"
                      element={
                        <RouteWithErrorBoundary element={<FactureList />} />
                      }
                    />
                    <Route
                      path="/stocks"
                      element={
                        <RouteWithErrorBoundary element={<StockList />} />
                      }
                    />
                    <Route
                      path="/vehicules"
                      element={
                        <RouteWithErrorBoundary element={<VehiculeList />} />
                      }
                    />
                    <Route
                      path="/pieces-vehicule"
                      element={
                        <RouteWithErrorBoundary
                          element={<PieceVehiculeList />}
                        />
                      }
                    />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
        </SidebarProvider>
      </UserProvider>
    </MuiThemeProvider>
  );
}
