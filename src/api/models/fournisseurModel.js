const db = require("../config/db");

const Fournisseur = {
  getAll: (callback) => {
    db.query("SELECT * FROM fournisseurs", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM fournisseurs WHERE id = ?", [id], callback);
  },

  create: (data, callback) => {
    const { nom, adresse, telephone, email } = data;
    db.query(
      "INSERT INTO fournisseurs (nom, adresse, telephone, email) VALUES (?, ?, ?, ?)",
      [nom, adresse, telephone, email],
      callback
    );
  },

  update: (id, data, callback) => {
    const { nom, adresse, telephone, email } = data;
    db.query(
      "UPDATE fournisseurs SET nom = ?, adresse = ?, telephone = ?, email = ? WHERE id = ?",
      [nom, adresse, telephone, email, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM fournisseurs WHERE id = ?", [id], callback);
  },
};

module.exports = Fournisseur;
