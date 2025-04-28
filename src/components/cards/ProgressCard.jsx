import {
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Box,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import "../../index.css";

export const ProgressCard = () => {
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #f6d365 0%, #e74619 100%)", // Dégradé orangé moderne
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
        color: "#ffffff", // Texte blanc
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
            Progression
          </Typography>
          <AssignmentIcon sx={{ fontSize: 32 }} />
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
            }}
          >
            75.5%
          </Typography>

          <LinearProgress
            variant="determinate"
            value={75.5}
            sx={{
              height: 10,
              borderRadius: 5,
              mt: 2,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#ffffff",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
