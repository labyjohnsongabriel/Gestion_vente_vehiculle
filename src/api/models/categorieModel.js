const db = require('../config/db');

const Categorie = {
  getAll: (callback) => {
    db.query('SELECT * FROM categories', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM categories name= ?, description= ? WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    db.query(sql, [data.name, data.description], callback);
  },

  update: (id, data, callback) => {
    const sql = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [data.name, data.description, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM categories WHERE id = ?', [id], callback);
  }
};

module.exports = Categorie;
