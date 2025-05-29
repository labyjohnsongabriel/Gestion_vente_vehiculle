import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
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
};

/*import {
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
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setStockData((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    fetchStockData();
  }, []);

  if (stockData.loading) return <CircularProgress />;
  if (stockData.error)
    return <Typography color="error">Erreur de chargement</Typography>;

  const isPositive = stockData.percentageChange >= 0;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)",
        boxShadow: 3,
        borderRadius: "20px",
        color: "#fff",
        minWidth: 300,
        transition: "transform 0.3s",
        "&:hover": { transform: "scale(1.03)" },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            INVENTAIRE
          </Typography>
          <InventoryIcon fontSize="large" />
        </Stack>

        <Typography variant="h3" my={2}>
          {stockData.totalItems}
        </Typography>

        <Box display="flex" alignItems="center">
          {isPositive ? (
            <ArrowUpwardIcon color="success" />
          ) : (
            <ArrowDownwardIcon color="error" />
          )}
          <Typography ml={1} color={isPositive ? "success.main" : "error.main"}>
            {Math.abs(stockData.percentageChange)}%
          </Typography>
          <Typography variant="caption" ml={1} fontStyle="italic">
            vs mois dernier
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
*/