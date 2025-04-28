const db = require('../config/db');

const Vehicule = {
    getAll: (callback) => {
      const sql = 'SELECT * FROM vehicules';
      db.query(sql, callback);
    },
    getById: (id, callback) => {
        const sql = 'SELECT * FROM vehicules WHERE id = ?';
        db.query(sql, [id], callback);
      },
    
  create: (data, callback) => {
    const { marque , modele, immatriculation, annee, kilometrage } = data;
    const sql = `INSERT INTO vehicules (marque, modele, immatriculation, annee, kilometrage, )
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [marque, modele, immatriculation, annee, kilometrage], callback);
  },

   update: (id, data, callback) => {
    const { marque , modele, immatriculation, annee, kilometrage } = data;
      const sql = `UPDATE vehicules SET marque= ?, modele = ?, immatriculation = ?, annee = ?, kilometrage = ?
                   WHERE id = ?`;
      db.query(sql, [marque, modele, immatriculation, annee, kilometrage], callback);
     },           
    

    delete: (id, callback) => {
        db.query("DELETE FROM vehicules WHERE id = ?", [id], callback);
      },
    };

    module.exports = Vehicule;