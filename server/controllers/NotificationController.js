// Exemple simple, à adapter selon votre base de données
const notifications = [
  { id: 1, message: "Test 1", read: false },
  { id: 2, message: "Test 2", read: false },
  { id: 3, message: "Test 3", read: false },
];

exports.getAllNotifications = (req, res) => {
  res.json(notifications);
};

exports.markAsRead = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Notification not found" });
  }
};

exports.markAllAsRead = (req, res) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ success: true });
};
