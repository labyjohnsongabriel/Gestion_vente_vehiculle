const db = require('../config/db');
const Piece = {
  getAll: (callback) => {
    const sql = 'SELECT * FROM pieces';
    db.query(sql, callback);
  },

  getById: (id, callback) => {
    const sql = 'SELECT * FROM pieces WHERE id = ?';
    db.query(sql, [id], callback);
  },

  create: (data, callback) => {
    const sql = `INSERT INTO pieces (name, description, price, image, category_id, fournisseur_id)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.name,
      data.description,
      data.price,
      data.image,
      data.category_id,
      data.fournisseur_id
    ], callback);
  },

  update: (id, data, callback) => {
    const sql = `UPDATE pieces SET name = ?, description = ?, price = ?, image = ?, category_id = ?, fournisseur_id = ?
                 WHERE id = ?`;
    db.query(sql, [
      data.name,
      data.description,
      data.price,
      data.image,
      data.category_id,
      data.fournisseur_id,
      id
    ], callback);
  },

  delete: (id, callback) => {
    const sql = 'DELETE FROM pieces WHERE id = ?';
    db.query(sql, [id], callback);
  }
};

module.exports = Piece;
