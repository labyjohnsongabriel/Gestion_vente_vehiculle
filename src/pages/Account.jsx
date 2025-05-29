import React, { useState, useRef, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/account.css";

const Account = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/users/profile");
      setUserData(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        
        const response = await axios.put("/api/users/profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        setUserData(response.data);
        toast.success("Photo de profil mise à jour avec succès");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour de la photo");
        console.error(error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put("/api/users/profile", userData);
      setUserData(response.data);
      setEditMode(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await axios.put("/api/users/profile", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success("Mot de passe mis à jour avec succès");
      setChangePasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
      console.error(error);
    }
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
              {!userData.avatar && userData.firstName?.charAt(0)}
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
              <>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  className="form-field"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  className="form-field"
                />
              </>
            ) : (
              <Typography variant="h4" className="user-name">
                {userData.firstName} {userData.lastName}
              </Typography>
            )}
            <Typography variant="subtitle1" className="user-email">
              {userData.email}
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
                  label="Prénom"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  fullWidth
                  className="form-field"
                />
                <TextField
                  label="Nom"
                  name="lastName"
                  value={userData.lastName}
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
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className="content-card">
              <Typography variant="h6" className="section-title">
                Photo de profil
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={userData.avatar}
                  sx={{ width: 80, height: 80 }}
                >
                  {!userData.avatar && userData.firstName?.charAt(0)}
                </Avatar>
                {editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={handleAvatarClick}
                  >
                    Changer la photo
                  </Button>
                )}
              </Box>
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
              <Button
                variant="outlined"
                className="security-button"
                onClick={() => setChangePasswordDialog(true)}
              >
                Changer le mot de passe
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
      >
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Mot de passe actuel"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Annuler</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Account;