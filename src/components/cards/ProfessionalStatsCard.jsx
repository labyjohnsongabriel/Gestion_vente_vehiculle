import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import axios from "axios";

// Configuration de l'API
const API_BASE_URL = "http://localhost:5000";

// Configuration des couleurs par type de carte
const CARD_CONFIG = {
  Ventes: {
    gradient: "linear-gradient(135deg, #6B73FF 0%, #764ba2 100%)",
    icon: "📊",
  },
  Clients: {
    gradient: "linear-gradient(135deg, #CE9FFC 0%, #7367F0 100%)",
    icon: "👥",
  },
  Revenus: {
    gradient: "linear-gradient(135deg, #42E695 0%, #3BB2B8 100%)",
    icon: "💰",
  },
  Commandes: {
    gradient: "linear-gradient(135deg, #FFCF71 0%, #2376DD 100%)",
    icon: "📦",
  },
  Défaut: {
    gradient: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
    icon: "📈",
  },
};

// Composant principal
export const ProfessionalStatsCard = ({
  title = "Ventes",
  apiEndpoint = "/api/ventes/count/all",
  refreshInterval = 0,
  description = "Statistiques principales",
}) => {
  const [data, setData] = useState({
    value: 0,
    trend: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fonction pour récupérer les données
  const fetchData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      const response = await axios.get(`${API_BASE_URL}${apiEndpoint}`);
      const value = response.data.count || 0;

      // Dans un cas réel, vous utiliseriez les données de tendance de l'API
      const trend =
        response.data.trend ||
        (Math.random() > 0.5
          ? Math.floor(Math.random() * 15)
          : -Math.floor(Math.random() * 10));

      setData({
        value,
        trend,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Erreur API:", error);
      setData({
        value: 0,
        trend: 0,
        loading: false,
        error: error.message,
        lastUpdated: null,
      });
    }
  }, [apiEndpoint]);

  // Effet pour le chargement initial et l'intervalle de rafraîchissement
  useEffect(() => {
    fetchData();

    let intervalId = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchData, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, refreshInterval]);

  // Configuration de la carte en fonction du titre
  const cardConfig = CARD_CONFIG[title] || CARD_CONFIG.Défaut;
  const isPositive = data.trend >= 0;

  // Formatage de la date de dernière mise à jour
  const formatLastUpdated = () => {
    if (!data.lastUpdated) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now - data.lastUpdated) / 1000);

    if (diffInSeconds < 60) return `Il y a ${diffInSeconds} sec`;
    if (diffInSeconds < 3600)
      return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    return `À ${data.lastUpdated.toLocaleTimeString()}`;
  };

  return (
    <Card
      sx={{
        background: cardConfig.gradient,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        borderRadius: "16px",
        padding: { xs: "16px", sm: "20px" },
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
        },
        color: "#ffffff",
        height: "100%",
        minWidth: "250px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
        {/* En-tête de la carte */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
          mb={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" sx={{ opacity: 0.9 }}>
              {cardConfig.icon}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              {title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Rafraîchir">
              <IconButton
                onClick={fetchData}
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={description}>
              <IconButton
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Contenu principal */}
        {data.loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "120px" }}
          >
            <CircularProgress color="inherit" size={32} />
          </Stack>
        ) : data.error ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ minHeight: "120px" }}
          >
            <ErrorIcon sx={{ fontSize: 40, opacity: 0.7 }} />
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ opacity: 0.8 }}
            >
              Erreur de chargement
            </Typography>
            <Typography
              variant="caption"
              textAlign="center"
              sx={{ opacity: 0.6 }}
            >
              {data.error}
            </Typography>
          </Stack>
        ) : (
          <>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                p: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
                textAlign: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  letterSpacing: 0.5,
                }}
              >
                {data.value.toLocaleString()}
              </Typography>
            </Box>

            {/* Indicateur de tendance */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isPositive ? (
                  <ArrowUpwardIcon sx={{ fontSize: 18, color: "#00e676" }} />
                ) : (
                  <ArrowDownwardIcon sx={{ fontSize: 18, color: "#ff1744" }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    ml: 0.5,
                    color: isPositive ? "#00e676" : "#ff1744",
                  }}
                >
                  {Math.abs(data.trend)}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    opacity: 0.9,
                  }}
                >
                  vs période précédente
                </Typography>
              </Box>

              {data.lastUpdated && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  {formatLastUpdated()}
                </Typography>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Composant de grille pour afficher plusieurs cartes
export const StatsGrid = ({ children, spacing = 3 }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: spacing,
        width: "100%",
        p: 3,
      }}
    >
      {children}
    </Box>
  );
};

export default ProfessionalStatsCard;
