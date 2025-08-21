const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

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
             commandes.created_at AS commande_date, factures.total AS commande_total
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
    const sql = "INSERT INTO factures (commande_id, total) VALUES (?, ?)";
    const [result] = await db.query(sql, [commande_id, total]);
    return result.insertId;
  },

  delete: async (id) => {
    const sql = "DELETE FROM factures WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },

  update: async (id, data) => {
    const validFields = ["commande_id", "total"];
    const fieldsToUpdate = {};

    for (const field in data) {
      if (validFields.includes(field)) {
        fieldsToUpdate[field] = data[field];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error("Aucun champ valide à mettre à jour");
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE factures SET ${setClause} WHERE id = ?`;
    const [result] = await db.query(sql, values);
    return result.affectedRows > 0;
  },

  generatePDF: async (factureData) => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const fileName = `facture_${factureData.id}.pdf`;
      const filePath = path.join(__dirname, "../public/factures", fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      doc.fontSize(20).text("FACTURE", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Numéro de facture: ${factureData.id}`);
      doc.text(`Client: ${factureData.client_name}`);
      doc.text(`Total: ${factureData.total} €`);
      doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`);

      doc.end();

      writeStream.on("finish", () => {
        resolve({ path: filePath, fileName });
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    });
  },

  sendInvoiceByEmail: async (factureId, emailService) => {
    try {
      const factureData = await Facture.getById(factureId);
      const { path: pdfPath } = await Facture.generatePDF(factureData);

      await emailService.sendEmail({
        to: factureData.client_email,
        subject: `Facture N° ${factureData.id}`,
        text: "Veuillez trouver ci-joint votre facture.",
        attachments: [
          {
            filename: `Facture_${factureData.id}.pdf`,
            path: pdfPath,
          },
        ],
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la facture:", error);
      throw error;
    }
  },
};

module.exports = Facture;
