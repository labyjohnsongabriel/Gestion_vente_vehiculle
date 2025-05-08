const db = require("../config/db");

const DetailsCommande = {
  getByCommandeId: async (commande_id, detail_id = null) => {
    let sql, params;

    if (detail_id) {
      // Si un ID de détail est fourni, on récupère ce détail spécifique
      sql = `
        SELECT dc.*, p.name AS piece_name 
        FROM details_commande dc
        JOIN pieces p ON dc.piece_id = p.id
        WHERE dc.id = ?
      `;
      params = [detail_id];
    } else {
      // Sinon on récupère tous les détails de la commande
      sql = `
        SELECT dc.*, p.name AS piece_name 
        FROM details_commande dc
        JOIN pieces p ON dc.piece_id = p.id
        WHERE dc.commande_id = ?
      `;
      params = [commande_id];
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  add: async (data) => {
    const sql = `
      INSERT INTO details_commande (commande_id, piece_id, quantity, price) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.commande_id,
      data.piece_id,
      data.quantity,
      data.price,
    ]);
    return result;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE details_commande 
      SET quantity = ?, price = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [data.quantity, data.price, id]);
    return result;
  },

  delete: async (id) => {
    const sql = "DELETE FROM details_commande WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  },

  // Méthode pour calculer le total d'une commande
  calculateCommandeTotal: async (commande_id) => {
    const sql = `
      SELECT SUM(quantity * price) as total
      FROM details_commande
      WHERE commande_id = ?
    `;
    const [result] = await db.query(sql, [commande_id]);
    return result[0].total || 0;
  },
};

module.exports = DetailsCommande;
