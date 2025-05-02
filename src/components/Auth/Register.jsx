import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  Grid,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Facebook,
  Google,
  Twitter,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../context/theme";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    const result = await register(userData);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="md"
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
            elevation={3}
            sx={{
              p: 6,
              width: "100%",
              maxWidth: "800px",
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
                bgcolor: "primary.main",
                width: 60,
                height: 60,
              }}
            >
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 4 }}>
              Créer un compte
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
              Remplissez le formulaire pour créer un compte
            </Typography>

            {error && (
              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "error.light",
                  color: "error.dark",
                  p: 3,
                  mb: 4,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">{error}</Typography>
              </Box>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", mt: 1 }}
            >
<TextField
  autoComplete="given-name"
  name="firstName"
  required
  fullWidth
  id="firstName"
  label="Prénom"
  autoFocus
  value={formData.firstName}
  onChange={handleChange}
  size="medium"
  sx={{
    mb: 3,
    "& .MuiInputBase-root": {
      height: "56px",
      fontSize: "1rem",
    },
  }}
/>

<TextField
  required
  fullWidth
  id="lastName"
  label="Nom"
  name="lastName"
  autoComplete="family-name"
  value={formData.lastName}
  onChange={handleChange}
  size="medium"
  sx={{
    mb: 3,
    "& .MuiInputBase-root": {
      height: "56px",
      fontSize: "1rem",
    },
  }}
/>

<TextField
  required
  fullWidth
  id="email"
  label="Email"
  name="email"
  autoComplete="email"
  value={formData.email}
  onChange={handleChange}
  size="medium"
  sx={{
    mb: 3,
    "& .MuiInputBase-root": {
      height: "56px",
      fontSize: "1rem",
    },
  }}
/>

<TextField
  required
  fullWidth
  name="password"
  label="Mot de passe"
  type={showPassword ? "text" : "password"}
  id="password"
  autoComplete="new-password"
  value={formData.password}
  onChange={handleChange}
  size="medium"
  sx={{
    mb: 3,
    "& .MuiInputBase-root": {
      height: "56px",
      fontSize: "1rem",
    },
  }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          edge="end"
          size="large"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

<TextField
  required
  fullWidth
  name="confirmPassword"
  label="Confirmer le mot de passe"
  type={showConfirmPassword ? "text" : "password"}
  id="confirmPassword"
  value={formData.confirmPassword}
  onChange={handleChange}
  size="medium"
  sx={{
    mb: 3,
    "& .MuiInputBase-root": {
      height: "56px",
      fontSize: "1rem",
    },
  }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowConfirmPassword}
          edge="end"
          size="large"
        >
          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>




              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 6,
                  mb: 3,
                  py: 2,
                  fontSize: "1.1rem",
                }}
              >
                S'inscrire
              </Button>
            </Box>

            <Divider sx={{ my: 4, width: "80%" }}>ou s'inscrire avec</Divider>

            <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
              <IconButton
                aria-label="Facebook"
                sx={{
                  bgcolor: "#1877F2",
                  color: "#fff",
                  width: 56,
                  height: 56,
                  "&:hover": { bgcolor: "#166FE5" },
                }}
              >
                <Facebook fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Google"
                sx={{
                  bgcolor: "#DB4437",
                  color: "#fff",
                  width: 56,
                  height: 56,
                  "&:hover": { bgcolor: "#C33D2E" },
                }}
              >
                <Google fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                sx={{
                  bgcolor: "#1DA1F2",
                  color: "#fff",
                  width: 56,
                  height: 56,
                  "&:hover": { bgcolor: "#1991DB" },
                }}
              >
                <Twitter fontSize="large" />
              </IconButton>
            </Stack>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Vous avez déjà un compte?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  underline="hover"
                  fontWeight={600}
                  fontSize="1.1rem"
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Register;

{
  /**!SECTIONimport React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Register = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F8F7FA 0%, #F0EEF5 100%)",
        p: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: 6,
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 6,
            background: "linear-gradient(90deg, #7367F0 0%, #FF9F43 100%)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: "primary.main",
              width: 60,
              height: 60,
              color: "#fff",
            }}
          >
            <PersonAddOutlined fontSize="large" />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{ mt: 2, mb: 1, fontWeight: 600 }}
          >
            Créer un compte
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Remplissez le formulaire pour commencer
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Inscription réussie! Redirection en cours...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Prénom"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            value={formData.firstName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Nom"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "S'inscrire"
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Vous avez déjà un compte?{" "}
            <Link
              component={RouterLink}
              to="/login"
              color="primary"
              fontWeight={600}
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
 */
}