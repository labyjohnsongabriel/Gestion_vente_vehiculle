{/*import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import "../../index.css";
import "../../theme/theme";

export const BudgetCard = () => {
  return (
    <Card
      className="stat-card"
      sx={{
        background: "linear-gradient(135deg, #74ebd5 0%, #2643c5 100%)", // Dégradé turquoise vers bleu
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        borderRadius: "20px",
        padding: "16px",
        width: "600px",
        maxWidth: "320px",
        transition: "all 0.4s ease",
        transform: "scale(1)",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
        },
        color: "#ffffff", // Tout en blanc par-dessus le gradient
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            BUDGET
          </Typography>
          <AttachMoneyIcon sx={{ fontSize: 32 }} />
        </Stack>

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mt: 2,
          }}
        >
          $24k
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <ArrowUpwardIcon sx={{ fontSize: 18, color: "#00e676" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              ml: 0.5,
              color: "#00e676",
            }}
          >
            12%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              ml: 1,
              opacity: 0.8,
              fontStyle: "italic",
            }}
          >
            Depuis le mois dernier
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};*/}
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useState } from "react";

export const BudgetCard = () => {
  const [stockData, setStockData] = useState({
    totalItems: 0,
    percentageChange: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // 1. Récupérer le nombre total de stocks
        const countRes = await fetch("/api/stocks/count");
        const countData = await countRes.json();

        // 2. Récupérer tous les stocks pour calculer la variation
        const allStocksRes = await fetch("/api/stocks");
        const allStocks = await allStocksRes.json();

        // Calcul manuel de la variation (exemple simplifié)
        const currentMonthTotal = allStocks.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const previousMonthTotal = currentMonthTotal * 0.9; // Simulation de données

        const change =
          ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

        setStockData({
          totalItems: countData.count || allStocks.length,
          percentageChange: parseFloat(change.toFixed(1)),
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setStockData((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    fetchStockData();
  }, []);

  if (stockData.loading) {
    return (
      <Card
        sx={{
          background: "linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)",
          boxShadow: "0 8px 32px rgba(58, 123, 213, 0.3)",
          borderRadius: "24px",
          minWidth: 320,
          minHeight: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffffff" }} size={40} />
      </Card>
    );
  }

  if (stockData.error) {
    return (
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
          borderRadius: "24px",
          color: "#fff",
          minWidth: 300,
          maxWidth: 380,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 32px 64px rgba(102, 126, 234, 0.4)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1, padding: "24px" }}>
          <Typography variant="h6" fontWeight="bold">
            Erreur de chargement
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            {stockData.error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const isPositive = stockData.percentageChange >= 0;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
        borderRadius: "24px",
        color: "#ffffff",
        minWidth: 280,
        maxWidth: 380,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 16px 48px rgba(102, 126, 234, 0.35)",
        },
        "&:active": {
          transform: "translateY(-4px) scale(1.01)",
        },
      }}
    >
      <CardContent sx={{ padding: "24px" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
        >
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                opacity: 0.9
              }}
            >
              Stocks
            </Typography>
          </Box>
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "12px",
              backdropFilter: "blur(10px)",
            }}
          >
            <InventoryIcon sx={{ fontSize: 28 }} />
          </Box>
        </Stack>

        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            mb: 3,
            fontSize: "3rem",
            lineHeight: 1
          }}
        >
          {stockData.totalItems.toLocaleString()}
        </Typography>

        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "8px 12px",
            backdropFilter: "blur(5px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: isPositive 
                ? "rgba(76, 217, 100, 0.2)" 
                : "rgba(255, 107, 107, 0.2)",
              borderRadius: "8px",
              padding: "4px 8px",
              mr: 2,
            }}
          >
            {isPositive ? (
              <ArrowUpwardIcon sx={{ fontSize: 16, color: "#4cd964" }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 16, color: "#ff6b6b" }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 0.5, 
                fontWeight: 600,
                color: isPositive ? "#4cd964" : "#ff6b6b"
              }}
            >
              {Math.abs(stockData.percentageChange)}%
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8, 
              fontWeight: 500,
              fontSize: "0.85rem"
            }}
          >
            vs mois dernier
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};