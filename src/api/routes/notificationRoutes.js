const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Route pour créer une notification
router.post("/", authMiddleware, notificationController.createNotification);

// ✅ Route pour récupérer les notifications d'un utilisateur
router.get("/", (req, res) => {
  res.status(200).json({
    notifications: [
      { id: 1, message: "Nouvelle commande reçue", isUnread: true },
      { id: 2, message: "Stock mis à jour", isUnread: false },
    ],
  });
});

// ✅ Route pour marquer une notification comme lue
router.put(
  "/:id/read",
  authMiddleware,
  notificationController.markNotificationAsRead
);

module.exports = router;
