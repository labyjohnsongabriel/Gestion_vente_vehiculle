import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  FormControl,
  Button,
  useMediaQuery,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Dashboard as DashboardIcon,
  Save as SaveIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  CheckCircle as CheckCircleIcon,
  SettingsBackupRestore as ResetIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";

// Composants stylisés
const SettingsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[6],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: "none",
  minHeight: "60px",
  fontSize: "0.95rem",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const SettingsSectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  "& .MuiTypography-root": {
    fontWeight: 600,
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.primary.main,
  },
}));

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    fontSize: "medium",
    language: "fr",
    dashboardLayout: "default",
    timezone: "Europe/Paris",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    // Simuler le chargement des paramètres sauvegardés
    const savedSettings = JSON.parse(localStorage.getItem("appSettings")) || {};
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simuler une requête API
      await new Promise((resolve) => setTimeout(resolve, 800));
      localStorage.setItem("appSettings", JSON.stringify(settings));
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      darkMode: false,
      notifications: true,
      fontSize: "medium",
      language: "fr",
      dashboardLayout: "default",
      timezone: "Europe/Paris",
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        pl: { sm: "280px" },
        transition: theme.transitions.create("padding", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}
          >
            <PaletteIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Paramètres
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Personnalisez votre expérience utilisateur
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 3 }} />
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        allowScrollButtonsMobile
        sx={{
          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
          },
        }}
      >
        <StyledTab
          label="Apparence"
          icon={<PaletteIcon />}
          iconPosition="start"
        />
        <StyledTab
          label="Notifications"
          icon={<NotificationsIcon />}
          iconPosition="start"
        />
        <StyledTab
          label="Préférences"
          icon={<DashboardIcon />}
          iconPosition="start"
        />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {/* Onglet Apparence */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <PaletteIcon />
                <Typography variant="h6">Thème</Typography>
              </SettingsSectionHeader>

              <Stack direction="row" alignItems="center" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={(e) =>
                        handleSettingChange("darkMode", e.target.checked)
                      }
                      color="primary"
                      size="medium"
                    />
                  }
                  label={`Mode ${settings.darkMode ? "sombre" : "clair"}`}
                />
                <Chip
                  icon={
                    settings.darkMode ? (
                      <DarkModeIcon fontSize="small" />
                    ) : (
                      <LightModeIcon fontSize="small" />
                    )
                  }
                  label={settings.darkMode ? "Sombre" : "Clair"}
                  variant="outlined"
                />
              </Stack>

              <FormControl sx={{ mt: 4 }} component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Taille de texte
                </FormLabel>
                <RadioGroup
                  value={settings.fontSize}
                  onChange={(e) =>
                    handleSettingChange("fontSize", e.target.value)
                  }
                  row
                  sx={{ gap: 2 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      flex: 1,
                      ...(settings.fontSize === "small" && {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }),
                    }}
                  >
                    <FormControlLabel
                      value="small"
                      control={<Radio />}
                      label="Petit"
                      sx={{ width: "100%" }}
                    />
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      flex: 1,
                      ...(settings.fontSize === "medium" && {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }),
                    }}
                  >
                    <FormControlLabel
                      value="medium"
                      control={<Radio />}
                      label="Moyen"
                      sx={{ width: "100%" }}
                    />
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      flex: 1,
                      ...(settings.fontSize === "large" && {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }),
                    }}
                  >
                    <FormControlLabel
                      value="large"
                      control={<Radio />}
                      label="Grand"
                      sx={{ width: "100%" }}
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <LanguageIcon />
                <Typography variant="h6">Langue & Région</Typography>
              </SettingsSectionHeader>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="language-label">Langue</InputLabel>
                <Select
                  labelId="language-label"
                  value={settings.language}
                  label="Langue"
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                >
                  <MenuItem value="fr">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 24, height: 24 }}>🇫🇷</Box>
                      <span>Français</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="en">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 24, height: 24 }}>🇬🇧</Box>
                      <span>English</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="es">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 24, height: 24 }}>🇪🇸</Box>
                      <span>Español</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="timezone-label">Fuseau horaire</InputLabel>
                <Select
                  labelId="timezone-label"
                  value={settings.timezone}
                  label="Fuseau horaire"
                  onChange={(e) =>
                    handleSettingChange("timezone", e.target.value)
                  }
                >
                  <MenuItem value="Europe/Paris">Paris (GMT+1)</MenuItem>
                  <MenuItem value="Europe/London">London (GMT+0)</MenuItem>
                  <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
                </Select>
              </FormControl>
            </SettingsCard>
          </Grid>
        </Grid>
      )}

      {/* Onglet Notifications */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <NotificationsIcon />
                <Typography variant="h6">
                  Préférences de notification
                </Typography>
              </SettingsSectionHeader>

              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) =>
                        handleSettingChange("notifications", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Notifications activées"
                />

                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Types de notifications
                  </FormLabel>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Alertes système"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Mises à jour"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Nouveaux messages"
                    />
                  </Stack>
                </FormControl>
              </Stack>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <NotificationsIcon />
                <Typography variant="h6">Méthodes de notification</Typography>
              </SettingsSectionHeader>

              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notifications par email"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notifications push"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Notifications SMS"
                />
              </Stack>
            </SettingsCard>
          </Grid>
        </Grid>
      )}

      {/* Onglet Préférences */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <DashboardIcon />
                <Typography variant="h6">
                  Disposition du tableau de bord
                </Typography>
              </SettingsSectionHeader>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="dashboard-layout-label">Disposition</InputLabel>
                <Select
                  labelId="dashboard-layout-label"
                  value={settings.dashboardLayout}
                  label="Disposition"
                  onChange={(e) =>
                    handleSettingChange("dashboardLayout", e.target.value)
                  }
                >
                  <MenuItem value="default">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box>📊</Box>
                      <span>Standard (recommandé)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="compact">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box>📉</Box>
                      <span>Compact</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="extended">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box>📈</Box>
                      <span>Étendu</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary">
                La disposition sera appliquée après rechargement de la page.
              </Typography>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <DashboardIcon />
                <Typography variant="h6">Options avancées</Typography>
              </SettingsSectionHeader>

              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch />}
                  label="Mode développeur"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Afficher les statistiques avancées"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Toujours afficher les tutoriels"
                />
              </Stack>
            </SettingsCard>
          </Grid>
        </Grid>
      )}

      {/* Actions */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          sx={{ minWidth: 200 }}
        >
          Réinitialiser
        </Button>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={isLoading}
            sx={{ minWidth: 250 }}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </Stack>
      </Box>

      {/* Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ width: "100%" }}
        >
          Vos paramètres ont été enregistrés avec succès !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
