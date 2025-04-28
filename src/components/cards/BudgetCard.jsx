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
