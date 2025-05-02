import { useEffect, useState } from "react";
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
