/**
 * Contrôleur de gestion des factures
 * Permet de créer, récupérer, supprimer et générer des factures en PDF
 *
 * @module controllers/factureController
 * @requires ../models/factureModel
 * @requires pdfkit
 * @requires fs-extra
 * @requires path
 * @requires moment
 * @requires qrcode
 * @requires ../config/config
 */

const Facture = require("../models/factureModel");
const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");
moment.locale("fr"); // Configuration de moment.js en français
const QRCode = require("qrcode");
const config = require("../config/config");

/**
 * Configuration des couleurs et styles pour les documents PDF
 */
const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  text: "#3a4b6d",
  lightText: "#6c757d",
  border: "#e0e0e0",
  bgEven: "#f9f9f9",
};

// Assurer que le répertoire des factures existe
const facturesDir = path.join(__dirname, "../public/factures");
fs.ensureDirSync(facturesDir);

/**
 * Récupère toutes les factures
 *
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 * @returns {object} JSON contenant les factures ou message d'erreur
 */
exports.getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.getAll();
    res.json(factures);
  } catch (error) {
    console.error("Erreur getAllFactures:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des factures",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Récupère une facture par son ID
 *
 * @param {object} req - Requête Express avec l'ID de la facture en paramètre
 * @param {object} res - Réponse Express
 * @returns {object} JSON contenant la facture ou message d'erreur
 */
exports.getFactureById = async (req, res) => {
  try {
    const factureId = req.params.id;
    if (!factureId) {
      return res.status(400).json({ message: "ID de facture manquant" });
    }

    const facture = await Facture.getById(factureId);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    res.json(facture);
  } catch (error) {
    console.error("Erreur getFactureById:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la facture",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Crée une nouvelle facture
 *
 * @param {object} req - Requête Express avec les données de la facture dans le corps
 * @param {object} res - Réponse Express
 * @returns {object} JSON contenant l'ID de la nouvelle facture ou message d'erreur
 */
exports.createFacture = async (req, res) => {
  try {
    const { commande_id, total } = req.body;

    if (!commande_id || total === undefined) {
      return res.status(400).json({
        message:
          "Données de facture incomplètes. Veuillez fournir au moins commande_id et total",
      });
    }

    const newFacture = await Facture.create({
      commande_id,
      total,
      // `date_facture` sera rempli automatiquement par la BDD (si défini avec DEFAULT CURRENT_TIMESTAMP)
    });

    res.status(201).json({
      id: newFacture.id,
      message: "Facture créée avec succès",
    });
  } catch (error) {
    console.error("Erreur createFacture:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la facture",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Supprime une facture par son ID
 *
 * @param {object} req - Requête Express avec l'ID de la facture en paramètre
 * @param {object} res - Réponse Express
 * @returns {object} JSON contenant un message de succès ou d'erreur
 */
exports.deleteFacture = async (req, res) => {
  try {
    const factureId = req.params.id;
    if (!factureId) {
      return res.status(400).json({ message: "ID de facture manquant" });
    }

    const deleted = await Facture.delete(factureId);
    if (!deleted) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteFacture:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la facture",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
exports.updateFacture = async (req, res) => {
  try {
    const factureId = req.params.id;
    if (!factureId) {
      return res.status(400).json({ message: "ID de facture manquant" });
    }

    // Use the correct method from your model (e.g., getById, findById, etc.)
    const existingFacture = await Facture.getById(factureId); // or findById, findOne, etc.
    if (!existingFacture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Use the correct update method from your model
    const updated = await Facture.update(factureId, req.body); // or update, modify, etc.

    res.json({
      message: "Facture mise à jour avec succès",
      updated: updated,
    });
  } catch (error) {
    console.error("Erreur updateFacture:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la facture",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.generatePDF = async (req, res) => {
  let filePath = null;

  try {
    const factureId = req.params.id;
    if (!factureId) {
      return res.status(400).json({ message: "ID de facture manquant" });
    }

    const factureData = await Facture.getById(factureId);
    if (!factureData) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Désactivez la récupération des lignes de commande si la table n'existe pas
    let lignesCommande = []; // Utilisez un tableau vide

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Facture #${factureId}`,
        Author: config.companyName,
        Subject: `Facture pour ${factureData.client_name || "Client"}`,
        Keywords: "facture, commande, paiement",
        CreationDate: new Date(),
      },
    });

    const fileName = `facture_${factureId}_${moment().format(
      "YYYYMMDD_HHmmss"
    )}.pdf`;
    filePath = path.join(facturesDir, fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Générer le contenu du PDF
    await generateFacturePDF(doc, factureData, lignesCommande);

    doc.end();

    stream.on("finish", () => {
      // Vérifier si la requête est encore active avant d'envoyer le fichier
      if (!res.headersSent && !res.writableEnded) {
        res.download(filePath, fileName, (err) => {
          if (err) {
            console.error("Erreur lors de l'envoi du PDF:", err);
            if (!res.headersSent && !res.writableEnded) {
              res.status(500).json({ message: "Erreur lors de l'envoi du PDF" });
            }
          }
          // Nettoyer le fichier temporaire après un délai
          setTimeout(() => {
            fs.unlink(filePath, (err) => {
              if (err && err.code !== "ENOENT") {
                console.error(
                  "Erreur lors de la suppression du fichier temporaire:",
                  err
                );
              }
            });
          }, 5000);
        });
      }
    });

    stream.on("error", (err) => {
      console.error("Erreur d'écriture du PDF:", err);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: "Erreur lors de la génération du PDF" });
      }

      // Essayer de nettoyer le fichier en cas d'erreur
      if (filePath) {
        fs.unlink(filePath).catch(console.error);
      }
    });
  } catch (error) {
    console.error("Erreur générale generatePDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Erreur lors de la génération du PDF",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // Essayer de nettoyer le fichier en cas d'erreur
    if (filePath) {
      fs.unlink(filePath).catch(console.error);
    }
  }
};

/**
 * Génère le contenu du PDF de la facture
 *
 * @param {PDFDocument} doc - Instance PDFKit Document
 * @param {object} factureData - Données de la facture
 * @param {array} lignesCommande - Lignes de commande (produits, quantités, prix)
 * @returns {Promise<void>}
 */
async function generateFacturePDF(doc, factureData, lignesCommande = []) {
  // Forcer les valeurs numériques pour éviter les erreurs de calcul
  const total = Number(factureData.total) || 0;
  const tauxTVA = Number(factureData.taux_tva) || 20; // Taux par défaut à 20%
  const montantTVA = total * (tauxTVA / 100);
  const totalTTC = total + montantTVA;

  // Logo de l'entreprise
  try {
    const logoPath = path.join(__dirname, "../public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 150 });
    } else {
      doc
        .fontSize(24)
        .fillColor(COLORS.primary)
        .text(config.companyName, 50, 45);
    }
  } catch (err) {
    console.error("Erreur lors du chargement du logo:", err);
    doc.fontSize(24).fillColor(COLORS.primary).text(config.companyName, 50, 45);
  }

  // En-tête du document
  doc
    .fontSize(24)
    .fillColor(COLORS.primary)
    .text("FACTURE", 350, 45, { align: "right" });

  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .text(`N° ${factureData.id}`, 350, 75, { align: "right" })
    .text(`Date: ${moment(factureData.date_facture).format("DD/MM/YYYY")}`, {
      align: "right",
    })
    .text(`Réf. Commande: #${factureData.commande_ref}`, { align: "right" });

  // Ligne de séparation
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(50, 120)
    .lineTo(550, 120)
    .stroke();

  // Informations de l'entreprise
  doc
    .fontSize(10)
    .fillColor(COLORS.lightText)
    .text(config.companyName, 50, 140);
  doc.text(config.companyAddress);
  doc.text(`Tél: ${config.companyPhone}`);
  doc.text(`Email: ${config.companyEmail}`);
  doc.text(`SIRET: ${config.companySiret}`);

  if (config.companyTVA) {
    doc.text(`N° TVA: ${config.companyTVA}`);
  }

  // Informations du client
  doc.fontSize(14).fillColor(COLORS.secondary).text("FACTURER À:", 350, 140);

  doc
    .fontSize(12)
    .fillColor(COLORS.text)
    .text(factureData.client_name || "Client", 350, 160);

  // Adresse client avec gestion des valeurs manquantes
  if (factureData.client_address) {
    const adresse = factureData.client_address.split("\n");
    adresse.forEach((ligne) => {
      doc.fontSize(10).text(ligne);
    });
  } else {
    doc.fontSize(10).text("Adresse non spécifiée");
  }

  // Informations de contact client avec gestion des valeurs manquantes
  if (factureData.client_email) {
    doc.fontSize(10).text(`Email: ${factureData.client_email}`);
  }

  if (factureData.client_telephone) {
    doc.fontSize(10).text(`Tél: ${factureData.client_telephone}`);
  }

  // Tableau des articles
  const tableTop = 240;
  const tableHeaders = ["Description", "Quantité", "Prix unitaire", "Total"];
  const tableWidths = [250, 70, 100, 80];

  // En-tête du tableau
  doc.fontSize(10).fillColor("#FFFFFF");
  doc.rect(50, tableTop, 500, 20).fill(COLORS.primary);

  let currentX = 60;
  tableHeaders.forEach((header, i) => {
    const align = i === 0 ? "left" : "right";
    const width = tableWidths[i];
    doc.text(header, currentX, tableTop + 6, { width, align });
    currentX += width;
  });

  // Contenu du tableau
  let y = tableTop + 30;

  // Formatage des montants pour l'affichage
  const formatMontant = (montant) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(montant) + " €"
    );
  };

  if (lignesCommande && lignesCommande.length > 0) {
    // Afficher les lignes de commande détaillées
    lignesCommande.forEach((ligne, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc
          .rect(50, y - 5, 500, 20)
          .fillColor(COLORS.bgEven)
          .fill();
      }

      // S'assurer que les valeurs sont bien des nombres
      const quantite = Number(ligne.quantite) || 0;
      const prixUnitaire = Number(ligne.prix_unitaire) || 0;
      const sousTotal = quantite * prixUnitaire;

      doc.fillColor(COLORS.text);
      doc.text(ligne.description || "Produit", 60, y, { width: 240 });
      doc.text(quantite.toString(), 310, y, {
        width: 70,
        align: "right",
      });
      doc.text(formatMontant(prixUnitaire), 380, y, {
        width: 90,
        align: "right",
      });
      doc.text(formatMontant(sousTotal), 470, y, {
        width: 70,
        align: "right",
      });

      y += 20;

      // Gestion de la pagination
      if (y > 700) {
        doc.addPage();

        // Réafficher l'en-tête du tableau sur la nouvelle page
        y = 50;
        doc.fontSize(10).fillColor("#FFFFFF");
        doc.rect(50, y, 500, 20).fill(COLORS.primary);

        currentX = 60;
        tableHeaders.forEach((header, i) => {
          const align = i === 0 ? "left" : "right";
          const width = tableWidths[i];
          doc.text(header, currentX, y + 6, { width, align });
          currentX += width;
        });

        y += 30;
      }
    });
  } else {
    // Si pas de détails, afficher une ligne générique pour la commande complète
    doc
      .rect(50, y - 5, 500, 20)
      .fillColor(COLORS.bgEven)
      .fill();

    doc.fillColor(COLORS.text);
    doc.text("Commande complète", 60, y, { width: 240 });
    doc.text("1", 310, y, { width: 70, align: "right" });
    doc.text(formatMontant(total), 380, y, {
      width: 90,
      align: "right",
    });
    doc.text(formatMontant(total), 470, y, {
      width: 70,
      align: "right",
    });

    y += 20;
  }

  // Ligne de séparation avant le total
  y += 10;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();

  // Résumé des totaux
  y += 20;
  doc.fontSize(12).fillColor(COLORS.text);

  // Sous-total
  doc.text("Sous-total:", 380, y, { width: 90, align: "right" });
  doc.text(formatMontant(total), 470, y, {
    width: 70,
    align: "right",
  });

  // TVA
  y += 20;
  doc.text(`TVA (${tauxTVA}%):`, 380, y, { width: 90, align: "right" });
  doc.text(formatMontant(montantTVA), 470, y, { width: 70, align: "right" });

  // Total TTC
  y += 25;
  doc.fontSize(14).fillColor(COLORS.primary);
  doc.text("TOTAL TTC:", 380, y, { width: 90, align: "right" });
  doc.text(formatMontant(totalTTC), 470, y, { width: 70, align: "right" });

  // Conditions de paiement
  y += 40;
  doc.fontSize(10).fillColor(COLORS.text);
  doc.text("CONDITIONS DE PAIEMENT", 50, y, { underline: true });
  y += 15;

  // Afficher les conditions de paiement personnalisées si disponibles
  if (factureData.conditions_paiement) {
    doc.text(factureData.conditions_paiement);
  } else {
    doc.text("Paiement à réception de la facture");
  }

  doc.text("Coordonnées bancaires: " + config.bankDetails);

  // Date d'échéance si disponible
  if (factureData.date_echeance) {
    doc.text(
      `Date d'échéance: ${moment(factureData.date_echeance).format(
        "DD/MM/YYYY"
      )}`
    );
  }

  // Ajouter un QR code pour faciliter le paiement
  try {
    // Créer un QR code contenant les informations de paiement
    const qrData = JSON.stringify({
      facture: factureData.id,
      client: factureData.client_name,
      montant: totalTTC.toFixed(2),
      reference: factureData.commande_ref,
      date: moment(factureData.date_facture).format("YYYY-MM-DD"),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    doc.image(qrCodeDataUrl, 430, y - 10, { width: 100 });

    // Ajouter une légende au QR code
    doc
      .fontSize(8)
      .text("Scannez pour payer", 430, y + 95, { width: 100, align: "center" });
  } catch (err) {
    console.error("Erreur lors de la génération du QR code:", err);
  }

  // Pied de page
  const pageBottom = doc.page.height - 50;
  doc.fontSize(8).fillColor(COLORS.lightText);
  doc.text(`${config.companyName} - ${config.companyAddress}`, 50, pageBottom, {
    align: "center",
    width: 500,
  });

  doc.text(
    `SIRET: ${config.companySiret}${
      config.companyTVA ? ` - TVA: ${config.companyTVA}` : ""
    }`,
    {
      align: "center",
      width: 500,
    }
  );

  doc.text(`Facture générée le ${moment().format("DD/MM/YYYY à HH:mm")}`, {
    align: "center",
    width: 500,
  });

  // Numéro de page pour les documents multi-pages
  const totalPages = doc.bufferedPageRange().count;
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(COLORS.lightText);
      doc.text(`Page ${i + 1} / ${totalPages}`, 50, pageBottom - 15, {
        align: "right",
        width: 500,
      });
    }
  }

  // Mention légale pour les micros-entreprises si applicable
  if (config.isExemptTVA) {
    doc.fontSize(8).fillColor(COLORS.lightText);
    doc.text("TVA non applicable, art. 293 B du CGI", 50, pageBottom - 30, {
      align: "center",
      width: 500,
    });
  }
}
