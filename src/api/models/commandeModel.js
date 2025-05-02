const db = require("../config/db");

const Commande = {
  getAll: async () => {
    try {
      const query = `
        SELECT commandes.*, 
               clients.name AS client_name, 
               CONCAT(users.firstName, ' ', users.lastName) AS user_name
        FROM commandes
        JOIN clients ON commandes.client_id = clients.id
        JOIN users ON commandes.user_id = users.id
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes :", err.message);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const query = `
        SELECT commandes.*, 
               clients.name AS client_name, 
               CONCAT(users.firstName, ' ', users.lastName) AS user_name
        FROM commandes
        JOIN clients ON commandes.client_id = clients.id
        JOIN users ON commandes.user_id = users.id
        WHERE commandes.id = ?
      `;
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (err) {
      console.error("Erreur lors de la récupération de la commande :", err.message);
      throw err;
    }
  },

  create: async (data) => {
    try {
      const { client_id, user_id } = data;
      const query = "INSERT INTO commandes (client_id, user_id) VALUES (?, ?)";
      const [result] = await db.query(query, [client_id, user_id]);
      return result.insertId;
    } catch (err) {
      console.error("Erreur lors de la création de la commande :", err.message);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const { client_id, user_id } = data;
      const query = "UPDATE commandes SET client_id = ?, user_id = ? WHERE id = ?";
      const [result] = await db.query(query, [client_id, user_id, id]);
      return result.affectedRows;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la commande :", err.message);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const query = "DELETE FROM commandes WHERE id = ?";
      const [result] = await db.query(query, [id]);
      return result.affectedRows;
    } catch (err) {
      console.error("Erreur lors de la suppression de la commande :", err.message);
      throw err;
    }
  },
};

module.exports = Commande;
