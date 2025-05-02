import React, { useState, useEffect } from "react";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { styled } from "@mui/material/styles";
import theme from "../components/context/theme";
import { ThemeProvider, createTheme } from "@mui/material/styles";


const PremiumAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[10],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  boxShadow: theme.shadows[5],
  "&:hover": {
    boxShadow: theme.shadows[10],
  },
}));

const ProfilePage = () => {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (profileData.newPassword !== profileData.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      const response = await axios.put(
        "/api/users/profile",
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setSuccess("Profil mis à jour avec succès");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.put("/api/users/profile/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
      setSuccess("Avatar mis à jour avec succès");
    } catch (error) {
      console.error("Error updating avatar:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'avatar"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              pb: 2,
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h3"
              fontWeight={700}
              color="primary"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Mon Profil Premium
            </Typography>

            {editMode ? (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                  sx={{ borderRadius: "12px" }}
                >
                  Annuler
                </Button>
                <GradientButton
                  variant="contained"
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ borderRadius: "12px" }}
                >
                  Enregistrer
                </GradientButton>
              </Stack>
            ) : (
              <GradientButton
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ borderRadius: "12px" }}
              >
                Modifier
              </GradientButton>
            )}
          </Box>

          {/* Status Messages */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: "12px", boxShadow: theme.shadows[1] }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: "12px", boxShadow: theme.shadows[1] }}
            >
              {success}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Left Column - Avatar & Basic Info */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(245, 245, 245, 0.7)",
                }}
              >
                <Box sx={{ position: "relative", mb: 3 }}>
                  <PremiumAvatar
                    src={user?.avatar || "/default-avatar.png"}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  {editMode && (
                    <label htmlFor="avatar-upload">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                      />
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          bgcolor: "background.paper",
                          "&:hover": {
                            bgcolor: "primary.light",
                          },
                        }}
                      >
                        <CameraIcon />
                      </IconButton>
                    </label>
                  )}
                </Box>

                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {user?.firstName} {user?.lastName}
                </Typography>

                <Chip
                  label={
                    user?.isAdmin ? "Administrateur" : "Utilisateur Premium"
                  }
                  color={user?.isAdmin ? "primary" : "secondary"}
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    borderRadius: "8px",
                    boxShadow: theme.shadows[1],
                  }}
                />

                <Stack spacing={1} sx={{ width: "100%", mt: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.email}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Membre depuis
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Right Column - Form */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: "12px",
                  background: "rgba(245, 245, 245, 0.7)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Informations Personnelles
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Grid>

                  {editMode && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ mb: 2 }}
                        >
                          Changer le mot de passe
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mot de passe actuel"
                          name="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={profileData.currentPassword}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              bgcolor: "background.paper",
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nouveau mot de passe"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.newPassword}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              bgcolor: "background.paper",
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                  edge="end"
                                >
                                  {showNewPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Confirmer le mot de passe"
                          name="confirmPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ProfilePage;
