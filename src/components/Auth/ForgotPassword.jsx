// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LockReset as LockResetIcon } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../context/theme";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 5,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 8,
                background: "linear-gradient(90deg, #7367F0 0%, #FF9F43 100%)",
              },
            }}
          >
            <Avatar
              sx={{
                m: 2,
                bgcolor: "secondary.main",
                width: 64,
                height: 64,
              }}
            >
              <LockResetIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ mt: 1, mb: 3 }}>
              Réinitialiser le mot de passe
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 4 }}
            >
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiInputBase-root": {
                    height: "56px",
                    fontSize: "1rem",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 2,
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Envoyer le lien"
                )}
              </Button>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Link
                component={RouterLink}
                to="/login"
                color="primary"
                underline="hover"
                fontWeight={600}
                fontSize="1.1rem"
              >
                Retour à la connexion
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ForgotPassword;
