const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ✅ Obtenir toutes les pièces
exports.getAllPieces = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, 
              f.nom AS fournisseur, 
              c.name AS categorie
         FROM pieces p
    LEFT JOIN fournisseurs f ON p.fournisseur_id = f.id
    LEFT JOIN categories c ON p.category_id = c.id`
    );
    res.status(200).json({
      status: "success",
      results: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("[getAllPieces] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des pièces." });
  }
};

// ✅ Obtenir une pièce par ID
exports.getPiece = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pieces WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Pièce non trouvée." });
    }
    res.status(200).json({ status: "success", data: rows[0] });
  } catch (err) {
    console.error("[getPiece] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la pièce." });
  }
};

// ✅ Créer une nouvelle pièce
exports.createPiece = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Requête invalide : corps manquant" });
    }
    const { name, reference, description, price, stock_quantity, category_id, fournisseur_id } =
      req.body;
    const image = req.file ? `/uploads/pieces/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO pieces (name, reference, description, price , stock_quantity, image, category_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, reference, description, price, stock_quantity, image, category_id, fournisseur_id]
    );

    res.status(201).json({
      status: "success",
      data: {
        id: result.insertId,
        name,
        reference,
        description,
        price,
        stock_quantity,
        image,
        category_id,
        fournisseur_id,
      },
    });
  } catch (err) {
    console.error("[createPiece] Erreur:", err.message);
    res.status(500).json({ error: "Erreur lors de la création de la pièce." });
  }
};

// ✅ Mettre à jour une pièce
exports.updatePiece = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Requête invalide : corps manquant" });
    }
    const { name, reference, description, price,stock_quantity, category_id, fournisseur_id } =
      req.body;
    let image = null;

    // Récupérer l'ancienne pièce
    const [oldRows] = await db.query("SELECT image FROM pieces WHERE id = ?", [
      req.params.id,
    ]);
    if (oldRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Pièce non trouvée." });
    }

    if (req.file) {
      image = `/uploads/pieces/${req.file.filename}`;
      const oldImagePath = path.join(
        __dirname,
        "../public",
        oldRows[0].image || ""
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const [result] = await db.query(
      "UPDATE pieces SET name = ?, reference = ?, description = ?, price = ?, stock_quantity= ?, image = COALESCE(?, image), category_id = ?, fournisseur_id = ? WHERE id = ?",
      [
        name,
        reference,
        description,
        price,
        stock_quantity,
        image,
        category_id,
        fournisseur_id,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Pièce non mise à jour." });
    }

    res
      .status(200)
      .json({ status: "success", message: "Pièce mise à jour avec succès." });
  } catch (err) {
    console.error("[updatePiece] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la pièce." });
  }
};

// ✅ Supprimer une pièce
exports.deletePiece = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT image FROM pieces WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Pièce non trouvée." });
    }

    if (rows[0].image) {
      const imagePath = path.join(__dirname, "../public", rows[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await db.query("DELETE FROM pieces WHERE id = ?", [req.params.id]);

    res
      .status(200)
      .json({ status: "success", message: "Pièce supprimée avec succès." });
  } catch (err) {
    console.error("[deletePiece] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la pièce." });
  }
};

// ✅ Télécharger une nouvelle image pour une pièce
exports.uploadPieceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "Aucune image téléchargée." });
    }

    const imagePath = `/uploads/pieces/${req.file.filename}`;

    const [oldRows] = await db.query("SELECT image FROM pieces WHERE id = ?", [
      req.params.id,
    ]);
    if (oldRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Pièce non trouvée." });
    }

    // Supprimer l'ancienne image
    if (oldRows[0].image) {
      const oldImagePath = path.join(__dirname, "../public", oldRows[0].image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await db.query("UPDATE pieces SET image = ? WHERE id = ?", [
      imagePath,
      req.params.id,
    ]);

    res.status(200).json({
      status: "success",
      message: "Image mise à jour avec succès.",
      imagePath,
    });
  } catch (err) {
    console.error("[uploadPieceImage] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de l’enregistrement de l’image." });
  }
};
