const db = require("../config/db");

const Client = {
  getAll: (callback) => {
    db.query("SELECT * FROM clients", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM clients WHERE id = ?", [id], callback);
  },

  create: (data, callback) => {
    const { name, email, phone, address } = data;
    db.query("INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address],
      callback
    );
  },

  update: (id, data, callback) => {
    const { name, email, phone, address } = data;
    db.query("UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM clients WHERE id = ?", [id], callback);
  },
};

module.exports = Client;
