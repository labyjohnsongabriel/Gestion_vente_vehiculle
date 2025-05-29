import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { CircularProgress, Typography } from "@mui/material";
import {
  ThemeProvider as MuiThemeProvider,
  useTheme,
} from "@mui/material/styles";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TopBar from "./components/layout/Topbar";
import { Sidebar } from "./components/layout/Sidebar";
import { UserProvider } from "./components/context/UserContext";
import { SidebarProvider } from "./components/context/SidebarContext";
import { SettingsProvider } from "./components/context/SettingsContext"; // adapte le chemin selon ton projet

import premiumTheme from "./theme/premiumTheme";
import axios from "axios";

// Pages imports
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
import CommandeDetails from "./pages/Commandes/CommandeDetails";

// URL de base de l'API
const API_BASE_URL = "http://localhost:5000/api";

// Configuration Axios
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Correction: ajout du paramètre "token"
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const AppLayout = ({ children, sidebarOpen, isMobile, toggleSidebar }) => (
  <Box
    sx={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      overflowX: "hidden",
    }}
  >
    <TopBar toggleSidebar={toggleSidebar} />
    <Sidebar isMobile={isMobile} open={sidebarOpen} onClose={toggleSidebar} />
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

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Vérification de la validité du token
    // Modification: Utilisation de l'endpoint correct ou gestion de l'absence d'API
    // Option 1: Essayer un endpoint alternatif si disponible
    axios
      .get(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Utilisateur non autorisé");
        }
      })
      .catch((error) => {
        console.error("Erreur de vérification :", error);

        // Option 2: Si aucun endpoint de vérification n'est disponible,
        // nous pouvons vérifier la structure du token JWT (solution temporaire)
        try {
          // Vérification basique de la validité du token (structure seulement)
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiry = payload.exp * 1000; // Convertir en millisecondes

            if (expiry > Date.now()) {
              // Token non expiré selon sa structure
              setIsAuthenticated(true);
            } else {
              // Token expiré
              localStorage.removeItem("token");
              navigate("/login");
            }
          } else {
            // Structure invalide
            localStorage.removeItem("token");
            navigate("/login");
          }
        } catch (tokenError) {
          // Erreur de parsing du token
          console.error("Erreur d'analyse du token:", tokenError);
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: (theme) => theme.palette.primary.main,
            animationDuration: "800ms",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: (theme) => theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: "0.03em",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          Chargement en cours...
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: (theme) => theme.palette.text.disabled,
            fontStyle: "italic",
          }}
        >
          Veuillez patienter
        </Typography>
      </Box>
    );
  }
  return isAuthenticated ? children : null;
};

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout
                    sidebarOpen={sidebarOpen}
                    isMobile={isMobile}
                    toggleSidebar={toggleSidebar}
                  >
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <RouteWithErrorBoundary element={<Dashboard />} />
                        }
                      />
                      <Route
                        path="/commandes/:id"
                        element={
                          <RouteWithErrorBoundary
                            element={<CommandeDetails />}
                          />
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
                          <RouteWithErrorBoundary
                            element={
                              <SettingsProvider>
                                <Settings />
                              </SettingsProvider>
                            }
                          />
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
                        element={
                          <RouteWithErrorBoundary element={<Account />} />
                        }
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
                          <RouteWithErrorBoundary
                            element={<FournisseurList />}
                          />
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
                </ProtectedRoute>
              }
            />
          </Routes>
        </SidebarProvider>
      </UserProvider>
    </MuiThemeProvider>
  );
}
