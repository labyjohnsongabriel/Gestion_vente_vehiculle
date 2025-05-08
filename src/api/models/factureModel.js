const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const Facture = {
  getAll: async () => {
    const sql = `
      SELECT factures.*, commandes.id AS commande_ref, clients.name AS client_name,
              clients.email AS client_email, clients.address AS client_address
      FROM factures
      JOIN commandes ON factures.commande_id = commandes.id
      JOIN clients ON commandes.client_id = clients.id
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  getById: async (id) => {
    const sql = `
      SELECT factures.*, commandes.id AS commande_ref, clients.name AS client_name,
             clients.email AS client_email, clients.address AS client_address,
             commandes.date AS commande_date, commandes.total AS commande_total
      FROM factures
      JOIN commandes ON factures.commande_id = commandes.id
      JOIN clients ON commandes.client_id = clients.id
      WHERE factures.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  create: async (data) => {
    const { commande_id, total } = data;
    const sql =
      "INSERT INTO factures (commande_id, total, date_facture) VALUES (?, ?, NOW())";
    const [result] = await db.query(sql, [commande_id, total]);
    return result.insertId;
  },

  delete: async (id) => {
    const sql = "DELETE FROM factures WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },

  // Fonction pour récupérer les lignes de commande associées à une commande
// Fonction pour récupérer les lignes de commande associées à une commande
getLignesCommande: async (commandeId) => {
  const sql = `
    SELECT details_commande.*, pieces.name AS description
    FROM details_commande
    JOIN pieces ON details_commande.piece_id = pieces.id
    WHERE commande_id = ?
  `;

  try {
    const [rows] = await db.query(sql, [commandeId]);
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des lignes de commande:", error);
    return [];
  }
},
};

module.exports = Facture;
