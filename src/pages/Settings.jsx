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
  Tooltip,
  IconButton,
  Badge,
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
  Info as InfoIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Smartphone as SmartphoneIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import axios from "axios";
import { useAuth } from "../components/context/AuthContext";
import { useTranslation } from "react-i18next";
import { languages, timezones } from "../components/utils/settingsData";
import { useSettings } from "../components/context/SettingsContext";

// Composants stylisés
const SettingsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
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

const SettingItem = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, token } = useAuth();
  const translation = useTranslation();
  const t = translation.t;
  const i18n = translation.i18n;

  const { settings, setSettings, loading: settingsLoading } = useSettings();

  const [tabValue, setTabValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (
      settings.language &&
      i18n &&
      typeof i18n.changeLanguage === "function"
    ) {
      i18n.changeLanguage(settings.language);
      localStorage.setItem("lang", settings.language);
    }
  }, [settings.language, i18n]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (name, value) => {
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(
        "/api/user/settings",
        { settings },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Failed to save settings:", error);
      showSnackbar(t("settings.saveError"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(
        "/api/user/settings/reset",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await axios.get("/api/user/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSettings(response.data);
      showSnackbar(t("settings.resetSuccess"));
    } catch (error) {
      console.error("Failed to reset settings:", error);
      showSnackbar(t("settings.resetError"), "error");
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if ((settingsLoading || !settings) && !settings) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

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
              {t("settings.title")}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t("settings.subtitle")}
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
          label={t("settings.appearance")}
          icon={<PaletteIcon />}
          iconPosition="start"
        />
        <StyledTab
          label={t("settings.notifications")}
          icon={<NotificationsIcon />}
          iconPosition="start"
        />
        <StyledTab
          label={t("settings.preferences")}
          icon={<DashboardIcon />}
          iconPosition="start"
        />
        <StyledTab
          label={t("settings.accessibility")}
          icon={<HelpOutlineIcon />}
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
                <Typography variant="h6">{t("settings.theme")}</Typography>
              </SettingsSectionHeader>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.darkMode")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.darkModeDescription")}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.themeMode === "dark"}
                  onChange={(e) =>
                    handleSettingChange(
                      "themeMode",
                      e.target.checked ? "dark" : "light"
                    )
                  }
                  color="primary"
                />
              </SettingItem>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.fontSize")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.fontSizeDescription")}
                  </Typography>
                </Box>
                <RadioGroup
                  value={settings.fontSize}
                  onChange={(e) =>
                    handleSettingChange("fontSize", e.target.value)
                  }
                  row
                  sx={{ gap: 1 }}
                >
                  <Tooltip title={t("settings.small")}>
                    <Radio value="small" size="small" />
                  </Tooltip>
                  <Tooltip title={t("settings.medium")}>
                    <Radio value="medium" size="small" />
                  </Tooltip>
                  <Tooltip title={t("settings.large")}>
                    <Radio value="large" size="small" />
                  </Tooltip>
                </RadioGroup>
              </SettingItem>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <LanguageIcon />
                <Typography variant="h6">
                  {t("settings.languageRegion")}
                </Typography>
              </SettingsSectionHeader>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.language")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.languageDescription")}
                  </Typography>
                </Box>
                <Select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 24, height: 24 }}>{lang.flag}</Box>
                        <span>{lang.name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </SettingItem>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.timezone")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.timezoneDescription")}
                  </Typography>
                </Box>
                <Select
                  value={settings.timezone}
                  onChange={(e) =>
                    handleSettingChange("timezone", e.target.value)
                  }
                  size="small"
                  sx={{ minWidth: 180 }}
                >
                  {timezones.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </SettingItem>
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
                  {t("settings.notificationPreferences")}
                </Typography>
              </SettingsSectionHeader>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.enableNotifications")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.enableNotificationsDescription")}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.notifications}
                  onChange={(e) =>
                    handleSettingChange("notifications", e.target.checked)
                  }
                  color="primary"
                />
              </SettingItem>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("settings.notificationTypes")}
                </Typography>
                <Stack spacing={2}>
                  <SettingItem>
                    <Box>
                      <Typography>{t("settings.systemAlerts")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.systemAlertsDescription")}
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={(e) =>
                        handleSettingChange("systemAlerts", e.target.checked)
                      }
                    />
                  </SettingItem>

                  <SettingItem>
                    <Box>
                      <Typography>{t("settings.updates")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.updatesDescription")}
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.updateNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "updateNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </SettingItem>

                  <SettingItem>
                    <Box>
                      <Typography>{t("settings.messages")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.messagesDescription")}
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.messageNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "messageNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </SettingItem>
                </Stack>
              </Box>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <NotificationsIcon />
                <Typography variant="h6">
                  {t("settings.notificationMethods")}
                </Typography>
              </SettingsSectionHeader>

              <Stack spacing={2}>
                <SettingItem>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography>
                        {t("settings.emailNotifications")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.emailNotificationsDescription")}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailNotifications",
                        e.target.checked
                      )
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SmartphoneIcon color="action" />
                    <Box>
                      <Typography>{t("settings.pushNotifications")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.pushNotificationsDescription")}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) =>
                      handleSettingChange("pushNotifications", e.target.checked)
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SmsIcon color="action" />
                    <Box>
                      <Typography>{t("settings.smsNotifications")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.smsNotificationsDescription")}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) =>
                      handleSettingChange("smsNotifications", e.target.checked)
                    }
                  />
                </SettingItem>
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
                  {t("settings.dashboardLayout")}
                </Typography>
              </SettingsSectionHeader>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.layoutStyle")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.layoutStyleDescription")}
                  </Typography>
                </Box>
                <Select
                  value={settings.dashboardLayout}
                  onChange={(e) =>
                    handleSettingChange("dashboardLayout", e.target.value)
                  }
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="default">
                    {t("settings.layoutDefault")}
                  </MenuItem>
                  <MenuItem value="compact">
                    {t("settings.layoutCompact")}
                  </MenuItem>
                  <MenuItem value="extended">
                    {t("settings.layoutExtended")}
                  </MenuItem>
                </Select>
              </SettingItem>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.denseLayout")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.denseLayoutDescription")}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.denseLayout}
                  onChange={(e) =>
                    handleSettingChange("denseLayout", e.target.checked)
                  }
                />
              </SettingItem>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <DashboardIcon />
                <Typography variant="h6">
                  {t("settings.advancedOptions")}
                </Typography>
              </SettingsSectionHeader>

              <Stack spacing={2}>
                <SettingItem>
                  <Box>
                    <Typography>{t("settings.developerMode")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.developerModeDescription")}
                    </Typography>
                  </Box>
                  <Switch
                    checked={settings.developerMode}
                    onChange={(e) =>
                      handleSettingChange("developerMode", e.target.checked)
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Box>
                    <Typography>{t("settings.advancedStats")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.advancedStatsDescription")}
                    </Typography>
                  </Box>
                  <Switch
                    checked={settings.advancedStats}
                    onChange={(e) =>
                      handleSettingChange("advancedStats", e.target.checked)
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Box>
                    <Typography>{t("settings.showTutorials")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.showTutorialsDescription")}
                    </Typography>
                  </Box>
                  <Switch
                    checked={settings.showTutorials}
                    onChange={(e) =>
                      handleSettingChange("showTutorials", e.target.checked)
                    }
                  />
                </SettingItem>
              </Stack>
            </SettingsCard>
          </Grid>
        </Grid>
      )}

      {/* Onglet Accessibilité */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard>
              <SettingsSectionHeader>
                <HelpOutlineIcon />
                <Typography variant="h6">
                  {t("settings.accessibility")}
                </Typography>
              </SettingsSectionHeader>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.reducedMotion")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.reducedMotionDescription")}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    handleSettingChange("reducedMotion", e.target.checked)
                  }
                />
              </SettingItem>

              <SettingItem>
                <Box>
                  <Typography>{t("settings.highContrast")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.highContrastDescription")}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) =>
                    handleSettingChange("highContrast", e.target.checked)
                  }
                />
              </SettingItem>
            </SettingsCard>
          </Grid>
        </Grid>
      )}

      {/* Actions */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          sx={{ minWidth: isMobile ? "100%" : 200 }}
          disabled={settingsLoading || isSaving}
        >
          {t("settings.reset")}
        </Button>

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          sx={{ width: isMobile ? "100%" : "auto" }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={settingsLoading || isSaving}
            sx={{ minWidth: isMobile ? "100%" : 250 }}
          >
            {isSaving ? t("settings.saving") : t("settings.saveChanges")}
          </Button>
        </Stack>
      </Box>

      {/* Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
