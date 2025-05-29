const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

// GET user settings
router.get("/", auth, (req, res) => {
  res.json({
    themeMode: "light",
    notifications: true,
    fontSize: "medium",
    language: "fr",
    dashboardLayout: "default",
    timezone: "Europe/Paris",
    systemAlerts: true,
    updateNotifications: true,
    messageNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    developerMode: false,
    advancedStats: false,
    showTutorials: true,
    reducedMotion: false,
    highContrast: false,
    denseLayout: false,
  });
});

// PUT user settings
router.put("/", auth, (req, res) => {
  // Ici, vous pouvez sauvegarder les settings dans la base si besoin
  res.json({ message: "Paramètres sauvegardés avec succès" });
});

// POST reset user settings
router.post("/reset", auth, (req, res) => {
  // Ici, vous pouvez réinitialiser les settings dans la base si besoin
  res.json({ message: "Paramètres réinitialisés avec succès" });
});

module.exports = router;
