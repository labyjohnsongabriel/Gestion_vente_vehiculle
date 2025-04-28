const db = require('../config/db');

const DetailsCommande = {
  getByCommandeId: (commande_id, callback) => {
    const sql = `
      SELECT dc.*, p.name AS piece_name 
      FROM details_commande dc
      JOIN pieces p ON dc.piece_id = p.id
      WHERE dc.commande_id = ?
    `;
    db.query(sql, [commande_id], callback);
  },

  add: (data, callback) => {
    const sql = `
      INSERT INTO details_commande (commande_id, piece_id, quantity, price) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [data.commande_id, data.piece_id, data.quantity, data.price], callback);
  },

  update: (id, data, callback) => {
    const sql = `
      UPDATE details_commande 
      SET quantity = ?, price = ?
      WHERE id = ?
    `;
    db.query(sql, [data.quantity, data.price, id], callback);
  },

  delete: (id, callback) => {
    const sql = "DELETE FROM details_commande WHERE id = ?";
    db.query(sql, [id], callback);
  }
};

module.exports = DetailsCommande;
