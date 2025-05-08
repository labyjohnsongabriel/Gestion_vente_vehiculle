const db = require("../config/db"); // Assurez-vous que ce fichier utilise mysql2/promise

const Stock = {
  getAll: async () => {
    const sql = `
      SELECT s.id, s.piece_id, s.quantity, p.name AS piece_name
      FROM stocks s
      JOIN pieces p ON s.piece_id = p.id
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getByPieceId: async (piece_id) => {
    const sql = `
      SELECT s.*, p.name AS piece_name
      FROM stocks s
      JOIN pieces p ON s.piece_id = p.id
      WHERE s.piece_id = ?
    `;
    const [rows] = await db.execute(sql, [piece_id]);
    return rows;
  },

  create: async ({ piece_id, quantity }) => {
    const sql = `
      INSERT INTO stocks (piece_id, quantity)
      VALUES (?, ?)
    `;
    const [result] = await db.execute(sql, [piece_id, quantity]);
    return result;
  },

  update: async (id, quantity) => {
    const sql = `
      UPDATE stocks SET quantity = ? WHERE id = ?
    `;
    const [result] = await db.execute(sql, [quantity, id]);
    return result;
  },

  delete: async (id) => {
    const sql = `
      DELETE FROM stocks WHERE id = ?
    `;
    const [result] = await db.execute(sql, [id]);
    return result;
  },
};

module.exports = Stock;
