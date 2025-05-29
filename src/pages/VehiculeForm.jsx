import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { CircularProgress, Typography, LinearProgress } from "@mui/material";
import {
  ThemeProvider as MuiThemeProvider,
  useTheme,
  keyframes,
} from "@mui/material/styles";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TopBar from "./components/layout/Topbar";
import { Sidebar } from "./components/layout/Sidebar";
import { UserProvider } from "./components/context/UserContext";
import { SidebarProvider } from "./components/context/SidebarContext";
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Animations sophistiquées et professionnelles
const modernPulse = keyframes`
  0% { 
    opacity: 0.4; 
    transform: scale(0.9) rotateX(0deg); 
    filter: blur(0px);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05) rotateX(5deg); 
    filter: blur(1px);
  }
  100% { 
    opacity: 0.4; 
    transform: scale(0.9) rotateX(0deg); 
    filter: blur(0px);
  }
`;

const smoothBounce = keyframes`
  0%, 20%, 50%, 80%, 100% { 
    transform: translateY(0) scale(1); 
  }
  40% { 
    transform: translateY(-12px) scale(0.95); 
  }
  60% { 
    transform: translateY(-6px) scale(1.02); 
  }
`;

const gradientShift = keyframes`
  0% { 
    background-position: 0% 50%; 
    opacity: 0.8;
  }
  50% { 
    background-position: 100% 50%; 
    opacity: 1;
  }
  100% { 
    background-position: 0% 50%; 
    opacity: 0.8;
  }
`;

const progressiveDotsAnimated = keyframes`
  0% { content: ''; }
  25% { content: '●'; }
  50% { content: '●●'; }
  75% { content: '●●●'; }
  100% { content: '●●●●'; }
`;

const smoothRotate = keyframes`
  0% { 
    transform: rotate(0deg) scale(1); 
    filter: brightness(1);
  }
  50% { 
    transform: rotate(180deg) scale(1.05); 
    filter: brightness(1.2);
  }
  100% { 
    transform: rotate(360deg) scale(1); 
    filter: brightness(1);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotateZ(0deg);
    opacity: 0.7;
  }
  25% { 
    transform: translateY(-4px) rotateZ(1deg);
    opacity: 0.9;
  }
  50% { 
    transform: translateY(-8px) rotateZ(0deg);
    opacity: 1;
  }
  75% { 
    transform: translateY(-4px) rotateZ(-1deg);
    opacity: 0.9;
  }
`;

const shimmerEffect = keyframes`
  0% { 
    background-position: -200% 0; 
    opacity: 0.5;
  }
  50% { 
    opacity: 1;
  }
  100% { 
    background-position: 200% 0; 
    opacity: 0.5;
  }
`;

const morphingLoader = keyframes`
  0% { 
    border-radius: 50% 50% 50% 50%;
    transform: scale(1) rotate(0deg);
  }
  25% { 
    border-radius: 60% 40% 60% 40%;
    transform: scale(0.9) rotate(90deg);
  }
  50% { 
    border-radius: 40% 60% 40% 60%;
    transform: scale(1.1) rotate(180deg);
  }
  75% { 
    border-radius: 60% 40% 60% 40%;
    transform: scale(0.95) rotate(270deg);
  }
  100% { 
    border-radius: 50% 50% 50% 50%;
    transform: scale(1) rotate(360deg);
  }
`;

// Composant de chargement principal sophistiqué
const ModernLoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundSize: "400% 400%",
      animation: `${gradientShift} 6s ease infinite`,
      zIndex: 9999,
      flexDirection: "column",
      gap: 4,
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      },
    }}
  >
    {/* Conteneur d'animation principal */}
    <Box
      sx={{
        position: "relative",
        width: 160,
        height: 160,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Cercles concentriques animés */}
      {[0, 1, 2, 3].map((index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            width: 120 - index * 20,
            height: 120 - index * 20,
            borderRadius: "50%",
            border: `${3 - index}px solid`,
            borderColor: `rgba(255, 255, 255, ${0.8 - index * 0.15})`,
            animation: `${modernPulse} ${
              2 + index * 0.5
            }s infinite ease-in-out`,
            animationDelay: `${index * 0.2}s`,
            opacity: 0.7 - index * 0.1,
          }}
        />
      ))}

      {/* Loader morphing central */}
      <Box
        sx={{
          width: 60,
          height: 60,
          background:
            "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)",
          backgroundSize: "400% 400%",
          animation: `${morphingLoader} 3s ease-in-out infinite, ${gradientShift} 4s ease infinite`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "40%",
            height: "40%",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            animation: `${floatingAnimation} 2s ease-in-out infinite`,
          },
        }}
      />

      {/* Particules flottantes */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`particle-${index}`}
          sx={{
            position: "absolute",
            width: 6,
            height: 6,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            top: `${20 + Math.sin((index * 45 * Math.PI) / 180) * 50}%`,
            left: `${20 + Math.cos((index * 45 * Math.PI) / 180) * 50}%`,
            animation: `${floatingAnimation} ${
              2 + Math.random()
            }s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>

    {/* Texte de chargement avec effet shimmer */}
    <Typography
      variant="h4"
      component="div"
      sx={{
        color: "white",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textAlign: "center",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.6) 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `${shimmerEffect} 3s ease-in-out infinite`,
        textShadow: "0 2px 10px rgba(0,0,0,0.3)",
        position: "relative",
        "&:after": {
          content: '""',
          position: "absolute",
          right: -30,
          top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.7em",
          animation: `${progressiveDotsAnimated} 2s infinite`,
        },
      }}
    >
      Chargement
    </Typography>

    {/* Message secondaire élégant */}
    <Typography
      variant="h6"
      sx={{
        color: "rgba(255, 255, 255, 0.8)",
        maxWidth: "60%",
        textAlign: "center",
        fontWeight: 400,
        letterSpacing: "0.02em",
        animation: `${floatingAnimation} 3s ease-in-out infinite`,
        textShadow: "0 1px 5px rgba(0,0,0,0.2)",
      }}
    >
      Configuration de votre environnement professionnel
    </Typography>

    {/* Barre de progression moderne */}
    <Box sx={{ width: "50%", maxWidth: 40, mt: 3 }}>
      <Box
        sx={{
          width: "100%",
          height: 8,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            animation: `${shimmerEffect} 2s ease-in-out infinite`,
          },
        }}
      >
        <LinearProgress
          sx={{
            height: "100%",
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)",
              backgroundSize: "200% 100%",
              animation: `${gradientShift} 3s ease infinite`,
              borderRadius: 10,
            },
          }}
        />
      </Box>
    </Box>

    {/* Indicateur de progression textuel */}
    <Typography
      variant="caption"
      sx={{
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "0.9rem",
        fontStyle: "italic",
        animation: `${floatingAnimation} 4s ease-in-out infinite`,
      }}
    >
      Optimisation en cours...
    </Typography>
  </Box>
);

// Composant de chargement compact pour les routes protégées
const CompactLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "300px",
      flexDirection: "column",
      gap: 3,
      padding: 4,
    }}
  >
    {/* Loader sophistiqué compact */}
    <Box
      sx={{
        position: "relative",
        width: 80,
        height: 80,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Cercles rotatifs */}
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            width: 60 - index * 15,
            height: 60 - index * 15,
            border: `${3 - index}px solid`,
            borderColor: (theme) =>
              `${theme.palette.primary.main}${Math.round(
                (0.8 - index * 0.2) * 255
              ).toString(16)}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: `${smoothRotate} ${1.5 + index * 0.3}s linear infinite`,
            animationDirection: index % 2 === 0 ? "normal" : "reverse",
          }}
        />
      ))}

      {/* Centre lumineux */}
      <Box
        sx={{
          width: 12,
          height: 12,
          backgroundColor: (theme) => theme.palette.primary.main,
          borderRadius: "50%",
          animation: `${modernPulse} 2s ease-in-out infinite`,
          boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}50`,
        }}
      />
    </Box>

    {/* Texte de chargement */}
    <Typography
      variant="h6"
      component="div"
      sx={{
        color: (theme) => theme.palette.text.primary,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textAlign: "center",
        position: "relative",
        "&:after": {
          content: '""',
          position: "absolute",
          right: -20,
          top: "50%",
          transform: "translateY(-50%)",
          animation: `${progressiveDotsAnimated} 1.5s infinite`,
          color: (theme) => theme.palette.primary.main,
        },
      }}
    >
      Chargement
    </Typography>

    {/* Sous-texte */}
    <Typography
      variant="body2"
      sx={{
        color: (theme) => theme.palette.text.secondary,
        fontStyle: "italic",
        animation: `${floatingAnimation} 3s ease-in-out infinite`,
      }}
    >
      Veuillez patienter un instant
    </Typography>
  </Box>
);

// Layout principal de l'application
const AppLayout = ({ children, sidebarOpen, isMobile, toggleSidebar }) => (
  <Box sx={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar open={sidebarOpen} onClose={() => !isMobile && toggleSidebar()} />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        marginLeft: sidebarOpen && !isMobile ? "280px" : 0,
        transition: (theme) =>
          theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <TopBar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Box sx={{ padding: 3 }}>{children}</Box>
    </Box>
  </Box>
);

// Composant pour les routes avec gestion d'erreur
const RouteWithErrorBoundary = ({ element }) => (
  <ErrorBoundary>{element}</ErrorBoundary>
);

// Composant de route protégée avec authentification
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

    // Vérification sophistiquée du token
    const verifyToken = async () => {
      try {
        // Tentative de vérification via API
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Utilisateur non autorisé");
        }
      } catch (error) {
        console.error("Erreur de vérification API:", error);

        // Fallback: vérification locale du token JWT
        try {
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiry = payload.exp * 1000;

            if (expiry > Date.now()) {
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem("token");
              navigate("/login");
            }
          } else {
            localStorage.removeItem("token");
            navigate("/login");
          }
        } catch (tokenError) {
          console.error("Erreur d'analyse du token:", tokenError);
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        // Délai minimum pour une expérience utilisateur fluide
        setTimeout(() => setLoading(false), 800);
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return <CompactLoader />;
  }

  return isAuthenticated ? children : null;
};

// Composant principal de l'application
export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [appLoading, setAppLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Simulation du chargement initial de l'application
  useEffect(() => {
    const initializeApp = async () => {
      // Simule le chargement des ressources essentielles
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAppLoading(false);
    };

    initializeApp();
  }, []);

  // Écran de chargement initial
  if (appLoading) {
    return <ModernLoadingScreen />;
  }

  return (
    <MuiThemeProvider theme={premiumTheme}>
      <UserProvider>
        <SidebarProvider value={{ sidebarOpen, toggleSidebar }}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Routes protégées */}
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
