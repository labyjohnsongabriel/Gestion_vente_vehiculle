import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

const SettingsContext = createContext(undefined);

const defaultSettings = {
  themeMode: "light", // 'light' | 'dark'
  fontSize: "medium", // 'small' | 'medium' | 'large'
  language: "fr",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    enabled: true,
    email: true,
    push: true,
    sms: false,
    types: {
      system: true,
      updates: true,
      messages: true,
    },
  },
  layout: {
    dashboard: "default", // 'default' | 'compact' | 'extended'
    dense: false,
  },
  advanced: {
    developerMode: false,
    advancedStats: false,
    showTutorials: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
  },
};

export const SettingsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { i18n } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les paramètres depuis l'API
  const loadSettings = async () => {
    if (!token) return;

    try {
      const response = await axios.get("/api/user/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fusionne les settings reçus avec les defaults pour garantir tous les champs
      setSettings({ ...defaultSettings, ...response.data });
    } catch (error) {
      console.error("Failed to load settings:", error);
      showSnackbar("Failed to load settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async (newSettings) => {
    try {
      await axios.put(
        "/api/user/settings",
        { settings: newSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fusionne pour garantir tous les champs
      setSettings({ ...defaultSettings, ...newSettings });
      showSnackbar("Settings saved successfully!");
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      showSnackbar("Failed to save settings", "error");
      return false;
    }
  };

  // Réinitialiser aux paramètres par défaut
  const resetSettings = async () => {
    try {
      await axios.post(
        "/api/user/settings/reset",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings({ ...defaultSettings });
      showSnackbar("Settings reset to defaults");
      return true;
    } catch (error) {
      console.error("Failed to reset settings:", error);
      showSnackbar("Failed to reset settings", "error");
      return false;
    }
  };

  // Mettre à jour un paramètre spécifique
  const updateSetting = async (path, value) => {
    const pathParts = path.split(".");
    const newSettings = { ...settings };

    let current = newSettings;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    const success = await saveSettings(newSettings);
    if (success) {
      // Effets secondaires après la mise à jour
      if (path === "language") {
        i18n.changeLanguage(value);
      }
    }
  };

  // Effets initiaux
  useEffect(() => {
    loadSettings();
  }, [token]);

  useEffect(() => {
    if (
      settings.language &&
      i18n &&
      typeof i18n.changeLanguage === "function"
    ) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSetting,
        saveSettings,
        resetSettings,
        defaultSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
