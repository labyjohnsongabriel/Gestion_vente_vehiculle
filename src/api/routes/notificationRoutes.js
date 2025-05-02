const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Route pour créer une notification
router.post("/", authMiddleware, notificationController.createNotification);

// ✅ Route pour récupérer les notifications d'un utilisateur
router.get("/", authMiddleware, notificationController.getUserNotifications);

// ✅ Route pour marquer une notification comme lue
router.put(
  "/:id/read",
  authMiddleware,
  notificationController.markNotificationAsRead
);

module.exports = router;
