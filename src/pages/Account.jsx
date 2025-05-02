import React, { useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import "../styles/account.css"; // ton fichier css

const Account = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    position: "Gérant",
    avatar: null, // Pour stocker l'URL de l'image
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setEditMode(false);
    // Ici vous ajouteriez la logique pour sauvegarder les données
    // y compris l'image de profil (userData.avatar)
  };

  return (
    <Container maxWidth="lg" className="account-container">
      <Paper elevation={3} className="profile-card">
        <Box className="profile-header">
          <Box sx={{ position: "relative" }}>
            <Avatar
              className="profile-avatar"
              src={userData.avatar}
              sx={{ width: 100, height: 100 }}
            >
              {!userData.avatar && userData.name.charAt(0)}
            </Avatar>
            {editMode && (
              <>
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                  }}
                >
                  <CameraIcon />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </>
            )}
          </Box>
          <Box className="user-info">
            {editMode ? (
              <TextField
                fullWidth
                label="Nom complet"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="form-field"
              />
            ) : (
              <Typography variant="h4" className="user-name">
                {userData.name}
              </Typography>
            )}
            <Typography variant="subtitle1" className="user-position">
              {userData.position}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={editMode ? <CheckIcon /> : <EditIcon />}
            onClick={editMode ? handleSave : () => setEditMode(true)}
            className="edit-button"
          >
            {editMode ? "Enregistrer" : "Modifier"}
          </Button>
        </Box>
      </Paper>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        className="account-tabs"
      >
        <Tab label="Profil" className="account-tab" />
        <Tab label="Sécurité" className="account-tab" />
        <Tab label="Activité" className="account-tab" />
      </Tabs>
      <Divider sx={{ mb: 3 }} />

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className="content-card">
              <Typography variant="h6" className="section-title">
                <PersonIcon className="section-icon" /> Informations
                personnelles
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Nom complet"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  fullWidth
                  className="form-field"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  fullWidth
                  className="form-field"
                />
                <TextField
                  label="Téléphone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  fullWidth
                  className="form-field"
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className="content-card">
              <Typography variant="h6" className="section-title">
                À propos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Membre depuis Janvier 2023
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Dernière connexion: Aujourd'hui à 14:30
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper elevation={2} className="content-card">
          <Typography variant="h6" className="section-title">
            <LockIcon className="section-icon" /> Sécurité du compte
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="subtitle1">Mot de passe</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Dernière modification il y a 3 mois
              </Typography>
              <Button variant="outlined" className="security-button">
                Changer le mot de passe
              </Button>
            </Box>
            <Box>
              <Typography variant="subtitle1">
                Authentification à deux facteurs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Actuellement désactivée
              </Typography>
              <Button variant="outlined" className="security-button">
                Activer 2FA
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Account;
