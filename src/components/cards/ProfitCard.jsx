{/*import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import "../../index.css";

export const ProfitCard = () => {
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #d4fc79 0%, #0fbe26 100%)", // Dégradé vert doux
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        borderRadius: "20px",
        padding: "16px",
        width: "800px",
        maxWidth: "350px",
        transition: "all 0.4s ease",
        transform: "scale(1)",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
        },
        color: "#ffffff", // Texte en blanc
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
            Profit
          </Typography>
          <MonetizationOnIcon sx={{ fontSize: 32 }} />
        </Stack>

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mt: 2,
          }}
        >
          $15k
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
            8%
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

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddBoxIcon from "@mui/icons-material/AddBox";

export const ProfitCard = () => {
  const [pieceData, setPieceData] = useState({
    count: 0,
    lowStock: 0,
    totalValue: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPieceData = async () => {2
      try {
        const response = await axios.get("http://localhost:5000/api/pieces");

        const pieces = response.data.data || [];
        const totalPieces = pieces.length;
        const lowStockPieces = pieces.filter(
          (piece) => piece.stock_quantity < 10
        ).length;
        const totalValue = pieces.reduce(
          (sum, piece) => sum + piece.price * piece.stock_quantity,
          0
        );

        setPieceData({
          count: totalPieces,
          lowStock: lowStockPieces,
          totalValue: totalValue,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données des pièces :",
          error
        );
        setPieceData({
          count: 0,
          lowStock: 0,
          totalValue: 0,
          loading: false,
          error: error.message,
        });
      }
    };

    fetchPieceData();
  }, []);

  if (pieceData.loading) {
    return (
      <Card
        sx={{
          minWidth: 320,
          minHeight: 180,
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Card>
    );
  }

  if (pieceData.error) {
    return (
      <Card
        sx={{
          minWidth: 420,
          minHeight: 180,
          borderRadius: "24px",
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          color: "#fff",
        }}
      >
        <CardContent>
          <Typography color="inherit">Erreur de chargement</Typography>
          <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
            {pieceData.error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const stockPercentage =
    pieceData.lowStock > 0 ? (pieceData.lowStock / pieceData.count) * 100 : 0;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
        borderRadius: "24px",
        color: "#fff",
        minWidth: 280,
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                opacity: 0.9,
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Pièces
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.75rem" }}
            >
              Inventaire total
            </Typography>
          </Box>
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              p: 1.5,
              backdropFilter: "blur(10px)",
            }}
          >
            <BuildIcon sx={{ fontSize: 28, opacity: 0.9 }} />
          </Box>
        </Stack>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            fontSize: "3rem",
            lineHeight: 1,
            mb: 2,
            background:
              "linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {pieceData.count.toLocaleString()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Chip
            icon={<InventoryIcon sx={{ fontSize: 16, color: "#2196f3" }} />}
            label={`${pieceData.totalValue.toLocaleString()} €`}
            sx={{
              background: "rgba(33, 150, 243, 0.15)",
              color: "#2196f3",
              fontWeight: 600,
              border: "1px solid rgba(33, 150, 243, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              fontStyle: "italic",
              fontSize: "0.75rem",
            }}
          >
            valeur totale
          </Typography>
        </Box>


        
        {pieceData.lowStock > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontSize: "0.75rem",
                  color: "#ff9800",
                }}
              >
                Stock faible: {pieceData.lowStock} pièces
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontSize: "0.75rem",
                  color: "#ff9800",
                }}
              >
                {stockPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stockPercentage}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#ff9800",
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}


        
        <Box
          sx={{
            pt: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: 24,
              height: 24,
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
            }}
          >
            <AddBoxIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              fontSize: "0.75rem",
            }}
          >
            Gestion des stocks en temps réel
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

