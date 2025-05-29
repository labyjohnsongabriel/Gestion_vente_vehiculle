const db = require("../config/db"); // mysql2/promise

const Vehicule = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM vehicules");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM vehicules WHERE id = ?", [id]);
    return rows[0];
  },

  create: async (data) => {
    const {
      marque,
      modele,
      immatriculation,
      annee,
      kilometrage,
      type,
      statut,
      date_ajout,
    } = data;
    const sql = `
      INSERT INTO vehicules (marque, modele, immatriculation, annee, kilometrage, type, statut, date_ajout)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      marque,
      modele,
      immatriculation,
      annee,
      kilometrage,
      type,
      statut,
      date_ajout,
    ]);
    return result;
  },

  update: async (id, data) => {
    const {
      marque,
      modele,
      immatriculation,
      annee,
      kilometrage,
      type,
      statut,
      date_ajout,
    } = data;
    const sql = `
      UPDATE vehicules 
      SET marque = ?, modele = ?, immatriculation = ?, annee = ?, kilometrage = ?, type = ?, statut = ?, date_ajout = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      marque,
      modele,
      immatriculation,
      annee,
      kilometrage,
      type,
      statut,
      date_ajout,

    ]);
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM vehicules WHERE id = ?", [id]);
    return result;
  },
};

module.exports = Vehicule;
