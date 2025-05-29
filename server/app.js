const express = require("express");
const app = express();

const NotificationController = require("../controllers/NotificationController");
const router = express.Router();

router.put("/read-all", NotificationController.markAllAsRead); // Route to mark all notifications as read
router.put("/:id/read", NotificationController.markAsRead); // Route to mark a notification as read
router.get("/", NotificationController.getAllNotifications); // Route to fetch all notifications

const notificationsRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationsRoutes);

module.exports = app;