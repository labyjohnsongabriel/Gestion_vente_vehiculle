const Notification = require("../models/notificationModel");

// ✅ Créer une notification
exports.createNotification = async (req, res) => {
  try {
    const { type, message, relatedId, userId } = req.body;

    if (!type || !message || !userId) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const notification = await Notification.create({
      type,
      message,
      relatedId,
      userId,
      read: false,
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error(
      "Erreur lors de la création de la notification :",
      err.message
    );
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la création de la notification.",
      });
  }
};

// ✅ Récupérer les notifications d'un utilisateur
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    res.json(notifications || []); // Renvoie un tableau vide si aucune notification n'est trouvée
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des notifications :",
      err.message
    );
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la récupération des notifications.",
      });
  }
};

// ✅ Marquer une notification comme lue
exports.markNotificationAsRead = async (req, res) => {
  try {
    const success = await Notification.markAsRead(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Notification non trouvée." });
    }
    res.json({ message: "Notification marquée comme lue." });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de la notification :",
      err.message
    );
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la mise à jour de la notification.",
      });
  }
};
