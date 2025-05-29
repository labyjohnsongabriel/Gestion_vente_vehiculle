const db = require("../config/db"); // Assurez-vous que db = mysql2.createPool(...).promise()

const Piece = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM pieces");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM pieces WHERE id = ?", [id]);
    return rows[0]; // retourne un seul objet
  },

  create: async (data) => {
    const sql = `
      INSERT INTO pieces (name, description, price, image, category_id, fournisseur_id, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.name,
      data.description,
      data.price,
      data.stock_qauntity,
      data.image,
      data.category_id,
      data.fournisseur_id,
    ]);
    return result.insertId; // retourne l’ID inséré
  },

  update: async (id, data) => {
    const sql = `
      UPDATE pieces SET name = ?, description = ?, price = ?, image = ?, category_id = ?, fournisseur_id = ?, stock_quantity= ?,
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      data.name,
      data.description,
      data.price,
      data.stock_quantity,
      data.image,
      data.category_id,
      data.fournisseur_id,
      id,
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM pieces WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Piece;
