const db = require("../config/db");

const Fournisseur = {
  getAll: async () => {
    const query = "SELECT * FROM fournisseurs";
    const [rows] = await db.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = "SELECT * FROM fournisseurs WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  create: async (data) => {
    const { nom, adresse, telephone, email, date_ajout } = data;
    const query =
      "INSERT INTO fournisseurs (nom, adresse, telephone, email, date_ajout) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(query, [
      nom,
      adresse,
      telephone,
      email,
      date_ajout,
    ]);
    return result.insertId;
  },

  update: async (id, data) => {
    const { nom, adresse, telephone, email, date_ajout } = data;
    const query =
      "UPDATE fournisseurs SET nom = ?, adresse = ?, telephone = ?, email = ?, date_ajout = ? WHERE id = ?";
    const [result] = await db.query(query, [
      nom,
      adresse,
      telephone,
      email,
      date_ajout,
      id,
    ]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const query = "DELETE FROM fournisseurs WHERE id = ?";
    const [result] = await db.query(query, [id]);
    return result.affectedRows;
  },
};

module.exports = Fournisseur;
