{/*import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleIcon from "@mui/icons-material/People";
import "../../index.css";

export const CustomersCard = () => {
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/clients/count"
        ); // 🔁 Adapte l'URL selon ton backend
        setClientCount(response.data.count);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre de clients :",
          error
        );
      }
    };

    fetchClientCount();
  }, []);

  return (
    <Card
      sx={{
        background: "linear-gradient(5deg, #ffecd2 0%, #a55a14 100%)",
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
        color: "#ffffff",
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
            Clients
          </Typography>
          <PeopleIcon sx={{ fontSize: 32 }} />
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: "bold", mt: 2 }}>
          {clientCount}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
          <ArrowUpwardIcon sx={{ fontSize: 18, color: "#00e676" }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", ml: 0.5, color: "#00e676" }}
          >
            16%
          </Typography>
          <Typography
            variant="caption"
            sx={{ ml: 1, opacity: 0.8, fontStyle: "italic" }}
          >
            Depuis le mois dernier
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
*/}

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
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export const CustomersCard = () => {
  const [clientData, setClientData] = useState({
    count: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/clients/count"
        );
        setClientData({
          count: response.data.count,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre de clients :",
          error
        );
        setClientData({
          count: 0,
          loading: false,
          error: error.message,
        });
      }
    };

    fetchClientCount();
  }, []);

  if (clientData.loading) {
    return (
      <Card
        sx={{
          minWidth: 120,
          minHeight: 180,
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff9a56 0%, #ffad56 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Card>
    );
  }

  if (clientData.error) {
    return (
      <Card
        sx={{
          minWidth: 250,
          minHeight: 180,
          borderRadius: "24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
        }}
      >
        <CardContent>
          <Typography color="inherit">Erreur de chargement</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
        borderRadius: "24px",
        color: "#fff",
        minWidth: 260,
        maxWidth: 380,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 32px 64px rgba(255, 154, 86, 0.4)",
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
          mb={1}
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
              Clients
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.75rem" }}
            >
              Clients actifs
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
            <PeopleIcon sx={{ fontSize: 28, opacity: 0.9 }} />
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
          {clientData.count.toLocaleString()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Chip
            icon={<TrendingUpIcon sx={{ fontSize: 16, color: "#4caf50" }} />}
            label="+16%"
            sx={{
              background: "rgba(76, 175, 80, 0.15)",
              color: "#4caf50",
              fontWeight: 600,
              border: "1px solid rgba(76, 175, 80, 0.3)",
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
            depuis le mois dernier
          </Typography>
        </Box>

        {/* Indicateur visuel supplémentaire */}
        <Box
          sx={{
            mt: 2,
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
            <PersonAddIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              fontSize: "0.75rem",
            }}
          >
            Nouveaux clients ce mois
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
