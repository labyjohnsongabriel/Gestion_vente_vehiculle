import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Box,
  Skeleton,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";

// Configuration de l'API - IMPORTANT: utiliser le bon port (5000 au lieu de 5173)
const API_BASE_URL = "http://localhost:5000";

export const ProgressCard = ({
  title = "COMMANDES",
  apiEndpoint = "/api/commandes/count/all",
  target = 100,
  color = "primary",
}) => {
  const [data, setData] = useState({
    count: 0,
    percentage: 0,
    trend: 0,
    loading: true,
    error: null,
  });

  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      // Utiliser l'URL complète avec le bon port
      const response = await axios.get(`${API_BASE_URL}${apiEndpoint}`);
      const count = response.data.count || 0;
      const percentage = target > 0 ? Math.min((count / target) * 100, 100) : 0;

      // Simulation d'une tendance (à remplacer par de vraies données)
      const trend =
        Math.random() > 0.5
          ? Math.floor(Math.random() * 15)
          : -Math.floor(Math.random() * 10);

      setData({
        count,
        percentage,
        trend,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur de chargement des données",
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [apiEndpoint, target]);

  const getColorScheme = (colorType) => {
    const schemes = {
      primary: {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        accent: "#ffffff",
      },
      success: {
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        accent: "#ffffff",
      },
      warning: {
        gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
        accent: "#ffffff",
      },
      error: {
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        accent: "#ffffff",
      },
      info: {
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        accent: "#333333",
      },
    };
    return schemes[colorType] || schemes.primary;
  };

  const colorScheme = getColorScheme(color);

  if (data.loading) {
    return (
      <Card
        sx={{
          
          borderRadius: "20px",
          padding: "16px",
          width: "100%",
          maxWidth: "350px",
          minHeight: "200px",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="50%" height={48} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={10}
              sx={{ borderRadius: 5 }}
            />
            <Skeleton variant="text" width="60%" height={24} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: colorScheme.gradient,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        borderRadius: "20px",
        padding: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "translateY(0px)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.2)",
        },
        color: colorScheme.accent,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "100px",
          height: "100px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          transform: "translate(30px, -30px)",
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: "1.1rem",
              }}
            >
              {title}
            </Typography>
            {data.trend !== 0 && (
              <Chip
                size="small"
                icon={<TrendingUpIcon sx={{ fontSize: "16px !important" }} />}
                label={`${data.trend > 0 ? "+" : ""}${data.trend}%`}
                sx={{
                  mt: 0.5,
                  backgroundColor:
                    data.trend > 0
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(244, 67, 54, 0.2)",
                  color: data.trend > 0 ? "#4caf50" : "#f44336",
                  fontSize: "0.75rem",
                  height: "20px",
                }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Actualiser les données" arrow>
              <IconButton
                size="small"
                onClick={fetchData}
                disabled={refreshing}
                sx={{
                  color: colorScheme.accent,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 20,
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>

            <AssignmentIcon sx={{ fontSize: 28, opacity: 0.9 }} />
          </Stack>
        </Stack>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: "2.5rem",
                lineHeight: 1,
              }}
            >
              {data.count.toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: "0.9rem",
              }}
            >
              / {target.toLocaleString()}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              mt: 0.5,
              fontSize: "0.85rem",
            }}
          >
            {data.percentage.toFixed(1)}% de l'objectif atteint
          </Typography>
        </Box>

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              Progression
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {data.percentage.toFixed(1)}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={data.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: colorScheme.accent,
                borderRadius: 4,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              },
            }}
          />
        </Box>

        {data.error && (
          <Typography
            variant="body2"
            sx={{
              color: "#ffcdd2",
              mt: 2,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <InfoIcon sx={{ fontSize: 16 }} />
            {data.error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour les statistiques des commandes
export const CommandesStatsCard = () => {
  return (
    <ProgressCard
      title="Commandes Total"
      apiEndpoint="/api/commandes/count/all"
      target={1000}
      color="primary"
    />
  );
};

// Exemple d'utilisation multiple
export const StatsGrid = () => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{
        width: "100%",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <ProgressCard
        title="Commandes"
        apiEndpoint="/api/commandes/count"
        target={500}
        color="primary"
      />

      <ProgressCard
        title="Clients"
        apiEndpoint="/api/clients/count"
        target={200}
        color="success"
      />

      <ProgressCard
        title="Produits"
        apiEndpoint="/api/produits/count"
        target={1000}
        color="warning"
      />

      <ProgressCard
        title="Ventes"
        apiEndpoint="/api/ventes/count"
        target={50000}
        color="info"
      />
    </Stack>
  );
};