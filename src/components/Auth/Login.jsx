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
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  CssBaseline,
} from "@mui/material";
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Facebook,
  Google,
  Twitter,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7367F0",
    },
    secondary: {
      main: "#FF9F43",
    },
    background: {
      default: "#F8F7FA",
    },
  },
  typography: {
    fontFamily: '"Public Sans", sans-serif',
  },
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirection vers la page de profil au lieu du dashboard
        navigate("/dashboard");
      } else {
        setError(result.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 5,
              width: "700px",
              borderRadius: "16px",
              borderTop: "6px solid transparent", // Ajout de transparent pour que borderImage fonctionne
              borderImageSlice: 1, // Nécessaire pour que borderImage fonctionne correctement
              borderImageSource:
                "linear-gradient(90deg, #7367F0 0%, #FF9F43 100%)",
            }}
          >
            <Avatar
              sx={{
                m: "auto",
                mb: 3,
                bgcolor: "primary.main",
                width: 56,
                height: 56,
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Bienvenue !
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Veuillez vous connecter à votre compte
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  color="primary"
                  underline="hover"
                >
                  Mot de passe oublié ?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: "#5d52d4",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Se connecter"
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
            </Divider>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              <IconButton
                aria-label="Facebook"
                sx={{
                  bgcolor: "#1877F2",
                  color: "#fff",
                  "&:hover": { bgcolor: "#166FE5" },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                aria-label="Google"
                sx={{
                  bgcolor: "#DB4437",
                  color: "#fff",
                  "&:hover": { bgcolor: "#C33D2E" },
                }}
              >
                <Google />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                sx={{
                  bgcolor: "#1DA1F2",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1991DB" },
                }}
              >
                <Twitter />
              </IconButton>
            </Stack>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Nouveau sur notre plateforme ?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  color="primary"
                  underline="hover"
                  fontWeight={500}
                >
                  Créer un compte
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
