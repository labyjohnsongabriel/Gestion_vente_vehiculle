const db = require("../config/db");

// Toutes les méthodes CRUD + getStats pour les ventes/statistiques
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
      console.error(
        "Erreur lors de la récupération des commandes :",
        err.message
      );
      throw err;
    }
  },
  // Ajoutez cette méthode dans votre objet Commande (dans commandeModel.js)
  count: async () => {
    try {
      const query = "SELECT COUNT(*) AS count FROM commandes";
      const [rows] = await db.query(query);
      return rows[0].count;
    } catch (err) {
      console.error("Erreur lors du comptage des commandes :", err.message);
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
      console.error(
        "Erreur lors de la récupération de la commande :",
        err.message
      );
      throw err;
    }
  },

  create: async (data) => {
    try {
      const { client_id, user_id, montant, status } = data;
      const query = `
        INSERT INTO commandes (client_id, user_id, montant, status, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [result] = await db.query(query, [
        client_id,
        user_id,
        montant,
        status,
      ]);
      return result.insertId;
    } catch (err) {
      console.error("Erreur lors de la création de la commande :", err.message);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const { client_id, user_id, montant, status } = data;
      const query = `
        UPDATE commandes 
        SET client_id = ?, user_id = ?, montant = ?, status = ? 
        WHERE id = ?
      `;
      const [result] = await db.query(query, [
        client_id,
        user_id,
        montant,
        status,
        id,
      ]);
      return result.affectedRows;
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour de la commande :",
        err.message
      );
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const query = "DELETE FROM commandes WHERE id = ?";
      const [result] = await db.query(query, [id]);
      return result.affectedRows;
    } catch (err) {
      console.error(
        "Erreur lors de la suppression de la commande :",
        err.message
      );
      throw err;
    }
  },

  getStats: async () => {
    try {
      const query = `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'en_preparation' THEN 1 ELSE 0 END) AS en_preparation,
          SUM(CASE WHEN status = 'valide' THEN 1 ELSE 0 END) AS valide,
          SUM(CASE WHEN status = 'livre' THEN 1 ELSE 0 END) AS livre,
          SUM(CASE WHEN status = 'annule' THEN 1 ELSE 0 END) AS annule,
          SUM(montant) AS montant_total,
          SUM(CASE WHEN status = 'livre' THEN montant ELSE 0 END) AS montant_livre
        FROM commandes
      `;
      const [rows] = await db.query(query);
      return rows[0];
    } catch (err) {
      console.error("Erreur lors du calcul des statistiques :", err.message);
      throw err;
    }
  },
};

module.exports = Commande;
