const db = require('../config/db');

const Stock = {
    getAll: (callback) => {
      const sql = 'SELECT s.id, s.piece_id, s.quantity, p.name AS piece_name FROM stocks s JOIN pieces p ON s.piece_id = p.id';
      db.query(sql, callback);
    },

    getByPieceId: (piece_id, callback) => {
        const sql = 'SELECT s.*, p.name AS piece_name FROM stocks s JOIN pieces p ON s.piece_id = p.id WHERE s.piece_id = ?';
        db.query(sql, [piece_id], callback);
      },

      create: (data, callback) => {
        const { piece_id , quantity } = data;
        const sql = `INSERT INTO stocks (piece_id, quantity)
                     VALUES (?, ?)`;
        db.query(sql, [piece_id, quantity], callback);
      },

      update: (id, quantity, callback) => {
          const sql = `UPDATE stocks SET quantity= ?  WHERE id = ?`;
          db.query(sql, [quantity, id], callback);
         },  

         delete: (id, callback) => {
        const sql ='DELETE FROM stocks WHERE id = ?';
        db.query(sql, [id], callback);
          },
        };
    
        module.exports = Stock;