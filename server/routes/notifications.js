const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");

// Route pour marquer une notification comme lue
router.put("/:id/read", NotificationController.markAsRead);

// Route pour marquer toutes les notifications comme lues
router.put("/read-all", NotificationController.markAllAsRead);

// Route pour récupérer toutes les notifications
router.get("/", NotificationController.getAllNotifications);

module.exports = router;
