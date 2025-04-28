const db = require("../config/db");

const Commande = {
  getAll: (callback) => {
    db.query(
      `SELECT commandes.*, clients.name AS client_name, users.name AS user_name 
       FROM commandes 
       JOIN clients ON commandes.client_id = clients.id 
       JOIN users ON commandes.user_id = users.id`,
      callback
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT commandes.*, clients.name AS client_name, users.name AS user_name 
       FROM commandes 
       JOIN clients ON commandes.client_id = clients.id 
       JOIN users ON commandes.user_id = users.id 
       WHERE commandes.id = ?`,
      [id],
      callback
    );
  },

  create: (data, callback) => {
    const { client_id, user_id } = data;
    db.query(
      "INSERT INTO commandes (client_id, user_id) VALUES (?, ?)",
      [client_id, user_id],
      callback
    );
  },

  update: (id, data, callback) => {
    const { client_id, user_id } = data;
    db.query(
      "UPDATE commandes SET client_id = ?, user_id = ? WHERE id = ?",
      [client_id, user_id, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM commandes WHERE id = ?", [id], callback);
  }
};

module.exports = Commande;
