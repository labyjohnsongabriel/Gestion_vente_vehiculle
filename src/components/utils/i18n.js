import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      settings: {
        title: "Settings",
        subtitle: "Customize your user experience",
        appearance: "Appearance",
        notifications: "Notifications",
        preferences: "Preferences",
        accessibility: "Accessibility",
        saveChanges: "Save Changes",
        saving: "Saving...",
        reset: "Reset to Default",
        saveSuccess: "Settings saved successfully!",
        saveError: "Failed to save settings",
        resetSuccess: "Settings reset to defaults",
        resetError: "Failed to reset settings",
        loadError: "Failed to load settings",
        // ... autres traductions
      },
    },
  },
  fr: {
    translation: {
      settings: {
        title: "Paramètres",
        subtitle: "Personnalisez votre expérience utilisateur",
        appearance: "Apparence",
        notifications: "Notifications",
        preferences: "Préférences",
        accessibility: "Accessibilité",
        saveChanges: "Enregistrer les modifications",
        saving: "Enregistrement...",
        reset: "Réinitialiser",
        saveSuccess: "Paramètres enregistrés avec succès !",
        saveError: "Échec de l'enregistrement des paramètres",
        resetSuccess: "Paramètres réinitialisés",
        resetError: "Échec de la réinitialisation",
        loadError: "Échec du chargement des paramètres",
        // ... autres traductions
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
