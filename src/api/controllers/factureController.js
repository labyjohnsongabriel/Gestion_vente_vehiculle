const Facture = require("../models/factureModel");
const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");
const QRCode = require("qrcode");

// Assurer que le répertoire des factures existe
const facturesDir = path.join(__dirname, "../public/factures");
fs.ensureDirSync(facturesDir);

exports.getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.getAll();
    res.json(factures);
  } catch (error) {
    console.error("Erreur getAllFactures:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des factures" });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const facture = await Facture.getById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.json(facture);
  } catch (error) {
    console.error("Erreur getFactureById:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la facture" });
  }
};

exports.createFacture = async (req, res) => {
  try {
    const newFactureId = await Facture.create(req.body);
    res
      .status(201)
      .json({ id: newFactureId, message: "Facture créée avec succès" });
  } catch (error) {
    console.error("Erreur createFacture:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la facture" });
  }
};

exports.deleteFacture = async (req, res) => {
  try {
    const deleted = await Facture.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteFacture:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la facture" });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const factureId = req.params.id;
    const factureData = await Facture.getById(factureId);

    if (!factureData) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Récupérer les détails des lignes de commande si nécessaire
    const lignesCommande = await Facture.getLignesCommande(
      factureData.commande_ref
    );

    // Générer le PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Facture #${factureId}`,
        Author: config.companyName,
      },
    });

    const fileName = `facture_${factureId}_${moment().format("YYYYMMDD")}.pdf`;
    const filePath = path.join(facturesDir, fileName);

    // Pipe le document PDF vers un fichier
    doc.pipe(fs.createWriteStream(filePath));

    // Ajouter du contenu au PDF
    await generateFacturePDF(doc, factureData, lignesCommande);

    // Finaliser le document
    doc.end();

    // Envoyer le fichier au client
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Erreur lors de l'envoi du PDF:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Erreur lors de l'envoi du PDF" });
        }
      }

      // Optionnel: supprimer le fichier après envoi
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err)
            console.error(
              "Erreur lors de la suppression du fichier temporaire:",
              err
            );
        });
      }, 5000);
    });
  } catch (error) {
    console.error("Erreur générale generatePDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Erreur lors de la génération du PDF" });
    }
  }
};

// Fonction qui génère le contenu du PDF
async function generateFacturePDF(doc, factureData, lignesCommande = []) {
  // Définir quelques couleurs et styles
  const colors = {
    primary: "#667eea",
    secondary: "#764ba2",
    text: "#3a4b6d",
    lightText: "#6c757d",
    border: "#e0e0e0",
  };

  // Logo de l'entreprise
  try {
    const logoPath = path.join(__dirname, "../public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 150 });
    } else {
      doc
        .fontSize(24)
        .fillColor(colors.primary)
        .text(config.companyName, 50, 45);
    }
  } catch (err) {
    console.error("Erreur lors du chargement du logo:", err);
    doc.fontSize(24).fillColor(colors.primary).text(config.companyName, 50, 45);
  }

  // En-tête du document
  doc
    .fontSize(24)
    .fillColor(colors.primary)
    .text("FACTURE", 350, 45, { align: "right" });

  doc
    .fontSize(12)
    .fillColor(colors.text)
    .text(`N° ${factureData.id}`, 350, 75, { align: "right" })
    .text(`Date: ${moment(factureData.date_facture).format("DD/MM/YYYY")}`, {
      align: "right",
    })
    .text(`Réf. Commande: #${factureData.commande_ref}`, { align: "right" });

  // Ligne de séparation
  doc
    .strokeColor(colors.border)
    .lineWidth(1)
    .moveTo(50, 120)
    .lineTo(550, 120)
    .stroke();

  // Informations de l'entreprise
  doc
    .fontSize(10)
    .fillColor(colors.lightText)
    .text(config.companyName, 50, 140);
  doc.text(config.companyAddress);
  doc.text(`Tél: ${config.companyPhone}`);
  doc.text(`Email: ${config.companyEmail}`);
  doc.text(`SIRET: ${config.companySiret}`);

  // Informations du client
  doc.fontSize(14).fillColor(colors.secondary).text("FACTURER À:", 350, 140);
  doc
    .fontSize(12)
    .fillColor(colors.text)
    .text(factureData.client_name, 350, 160);
  doc.fontSize(10).text(factureData.client_address || "Adresse non spécifiée");
  doc.text(factureData.client_email || "Email non spécifié");

  // Tableau des articles
  const tableTop = 240;
  const tableHeaders = ["Description", "Quantité", "Prix unitaire", "Total"];
  const tableWidths = [250, 70, 100, 80];

  // En-tête du tableau
  doc.fontSize(10).fillColor("#FFFFFF");
  doc.rect(50, tableTop, 500, 20).fill(colors.primary);

  let currentX = 60;
  tableHeaders.forEach((header, i) => {
    const align = i === 0 ? "left" : "right";
    const width = tableWidths[i];
    doc.text(header, currentX, tableTop + 6, { width, align });
    currentX += width;
  });

  // Contenu du tableau
  let y = tableTop + 30;

  if (lignesCommande && lignesCommande.length > 0) {
    // Si nous avons des lignes de commande, les afficher
    lignesCommande.forEach((ligne, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc
          .rect(50, y - 5, 500, 20)
          .fillColor("#f9f9f9")
          .fill();
      }

      doc.fillColor(colors.text);
      doc.text(ligne.description || "Produit", 60, y, { width: 240 });
      doc.text(ligne.quantite.toString(), 310, y, {
        width: 70,
        align: "right",
      });
      doc.text(`${ligne.prix_unitaire.toFixed(2)} €`, 380, y, {
        width: 90,
        align: "right",
      });
      doc.text(
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} €`,
        470,
        y,
        { width: 70, align: "right" }
      );

      y += 20;

      // Si nous arrivons en bas de page, créer une nouvelle page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  } else {
    // Si nous n'avons pas de détails, afficher une ligne générique
    doc
      .rect(50, y - 5, 500, 20)
      .fillColor("#f9f9f9")
      .fill();
    doc.fillColor(colors.text);
    doc.text("Commande complète", 60, y, { width: 240 });
    doc.text("1", 310, y, { width: 70, align: "right" });
    doc.text(`${factureData.total.toFixed(2)} €`, 380, y, {
      width: 90,
      align: "right",
    });
    doc.text(`${factureData.total.toFixed(2)} €`, 470, y, {
      width: 70,
      align: "right",
    });

    y += 20;
  }

  // Ligne de séparation avant le total
  y += 10;
  doc
    .strokeColor(colors.border)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();

  // Total
  y += 20;
  doc.fontSize(12).fillColor(colors.text);

  // Sous-total
  doc.text("Sous-total:", 380, y, { width: 90, align: "right" });
  doc.text(`${factureData.total.toFixed(2)} €`, 470, y, {
    width: 70,
    align: "right",
  });

  // TVA
  y += 20;
  doc.text("TVA (20%):", 380, y, { width: 90, align: "right" });
  const tva = factureData.total * 0.2;
  doc.text(`${tva.toFixed(2)} €`, 470, y, { width: 70, align: "right" });

  // Total TTC
  y += 25;
  doc.fontSize(14).fillColor(colors.primary);
  doc.text("TOTAL TTC:", 380, y, { width: 90, align: "right" });
  const totalTTC = factureData.total * 1.2;
  doc.text(`${totalTTC.toFixed(2)} €`, 470, y, { width: 70, align: "right" });

  // Conditions de paiement
  y += 40;
  doc.fontSize(10).fillColor(colors.text);
  doc.text("CONDITIONS DE PAIEMENT", 50, y, { underline: true });
  y += 15;
  doc.text("Paiement à réception de la facture");
  doc.text("Coordonnées bancaires: " + config.bankDetails);

  // Ajouter un QR code pour faciliter le paiement
  try {
    const qrData = `Facture ${factureData.id} - ${
      factureData.client_name
    } - ${totalTTC.toFixed(2)} €`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    doc.image(qrCodeDataUrl, 430, y - 10, { width: 100 });
  } catch (err) {
    console.error("Erreur lors de la génération du QR code:", err);
  }

  // Pied de page
  const pageBottom = doc.page.height - 50;
  doc.fontSize(8).fillColor(colors.lightText);
  doc.text(`${config.companyName} - ${config.companyAddress}`, 50, pageBottom, {
    align: "center",
  });
  doc.text(`SIRET: ${config.companySiret} - TVA: ${config.companyTVA}`, {
    align: "center",
  });
  doc.text("Facture générée le " + moment().format("DD/MM/YYYY à HH:mm"), {
    align: "center",
  });

  // Numéro de page
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(colors.lightText);
    doc.text(`Page ${i + 1} / ${totalPages}`, 50, pageBottom - 15, {
      align: "right",
    });
  }
}
