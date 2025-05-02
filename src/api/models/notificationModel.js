const db = require("../config/db");

const Notification = {
  create: async ({ type, message, relatedId, userId, read }) => {
    try {
      const query = `
        INSERT INTO notifications (type, message, related_id, user_id, read, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const [result] = await db.query(query, [
        type,
        message,
        relatedId,
        userId,
        read,
      ]);
      return { id: result.insertId, type, message, relatedId, userId, read };
    } catch (err) {
      console.error(
        "Erreur lors de la création de la notification :",
        err.message
      );
      throw err;
    }
  },

  findByUserId: async (userId) => {
    try {
      const query = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      const [rows] = await db.query(query, [userId]);
      return rows;
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des notifications :",
        err.message
      );
      throw err;
    }
  },

  markAsRead: async (id) => {
    try {
      const query = `
        UPDATE notifications
        SET read = true
        WHERE id = ?
      `;
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour de la notification :",
        err.message
      );
      throw err;
    }
  },
};

module.exports = Notification;
