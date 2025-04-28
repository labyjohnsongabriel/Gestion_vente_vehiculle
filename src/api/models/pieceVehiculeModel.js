const db = require('../config/db');

const PieceVehicule = {
  getAll: (callback) => {
    const sql = 'SELECT pv.id, pv.piece_id, pv.vehicule_id, p.name AS piece_name, v.marque, v.modele FROM piece_vehicule pv JOIN pieces p ON pv.piece_id = p.id JOIN vehicules v ON pv.vehicule_id = v.id';
    db.query(sql, callback);
  },

  getByVehiculeId: (vehicule_id, callback) => {
    const sql = 'SELECT pv.id, pv.piece_id, p.name AS piece_name FROM piece_vehicule pv JOIN pieces p ON pv.piece_id = p.id WHERE pv.vehicule_id =?';
    db.query(sql, [vehicule_id], callback);
  },

  create: (data, callback) => {
    const { piece_id , vehicule_id } = data;
    const sql = "INSERT INTO piece_vehicule (piece_id, vehicule_id) VALUES (?, ?)";
    db.query(sql, [piece_id, vehicule_id], callback);
  },

  update: (id, data, callback) => {
    const { piece_id, vehicule_id } = data;
    const sql = `UPDATE piece_vehicule SET piece_id= ?, vehicule_id = ? WHERE id = ?`;
    db.query(sql, [piece_id, vehicule_id, id], callback);
   },  

   delete: (id, callback) => {
  const sql ='DELETE FROM piece_vehicule WHERE id = ?';
  db.query(sql, [id], callback);
    },
  };

  module.exports = PieceVehicule;