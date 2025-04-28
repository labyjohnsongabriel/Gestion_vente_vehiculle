const db = require("../config/db");

const Facture = {
  getAll: (callback) => {
    const sql = `
      SELECT factures.*, commandes.id AS commande_ref, clients.name AS client_name
      FROM factures
      JOIN commandes ON factures.commande_id = commandes.id
      JOIN clients ON commandes.client_id = clients.id
    `;
    db.query(sql, callback);
  },

  getById: (id, callback) => {
    const sql = `
      SELECT factures.*, commandes.id AS commande_ref, clients.name AS client_name
      FROM factures
      JOIN commandes ON factures.commande_id = commandes.id
      JOIN clients ON commandes.client_id = clients.id
      WHERE factures.id = ?
    `;
    db.query(sql, [id], callback);
  },

  create: (data, callback) => {
    const { commande_id, total } = data;
    const sql = "INSERT INTO factures (commande_id, total) VALUES (?, ?)";
    db.query(sql, [commande_id, total], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM factures WHERE id = ?", [id], callback);
  }
};

module.exports = Facture;
