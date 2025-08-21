const db = require("../config/db"); // Connexion MySQL avec Promesse

const Client = {
  // 🔍 Obtenir tous les clients
  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM clients");
      return rows;
    } catch (err) {
      console.error("[Client.getAll] Erreur:", err.message);
      throw new Error("Erreur lors de la récupération des clients");
    }
  },

  // 🔍 Obtenir un client par ID
  getById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (err) {
      console.error("[Client.getById] Erreur:", err.message);
      throw new Error("Erreur lors de la récupération du client");
    }
  },

  // ➕ Créer un nouveau client
  create: async ({
    name,
    email,
    phone,
    address,
    status = "active",
    image = null,
  }) => {
    try {
      const [result] = await db.query(
        "INSERT INTO clients (name, email, phone, address, status, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [name, email, phone, address, status, image]
      );
      return {
        id: result.insertId,
        name,
        email,
        phone,
        address,
        status,
        image,
      };
    } catch (err) {
      console.error("[Client.create] Erreur:", err.message);
      throw new Error("Erreur lors de la création du client");
    }
  },

  // 🔁 Mettre à jour un client
  update: async (id, { name, email, phone, address, status, image }) => {
    try {
      const [result] = await db.query(
        "UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, status = ?, image = ?, updatedAt = NOW() WHERE id = ?",
        [name, email, phone, address, status, image, id]
      );
      return result;
    } catch (err) {
      console.error("[Client.update] Erreur:", err.message);
      throw new Error("Erreur lors de la mise à jour du client");
    }
  },

  // ❌ Supprimer un client
  delete: async (id) => {
    try {
      const [result] = await db.query("DELETE FROM clients WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("[Client.delete] Erreur:", err.message);
      throw new Error("Erreur lors de la suppression du client");
    }
  },

  // 📊 Compter le nombre de clients
  count: async () => {
    try {
      const [rows] = await db.query("SELECT COUNT(*) AS count FROM clients");
      return rows[0].count;
    } catch (err) {
      console.error("[Client.count] Erreur:", err.message);
      throw new Error("Erreur lors du comptage des clients");
    }
  },
};

module.exports = Client;
