const fs = require("fs");
const path = require("path");
const Piece = require("../models/pieceModel");

exports.getAllPieces = async (req, res) => {
  try {
    const pieces = await Piece.findAll();
    res.status(200).json({
      status: "success",
      results: pieces.length,
      data: { pieces },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des pièces",
      error: err.message,
    });
  }
};

exports.getPiece = async (req, res) => {
  try {
    const piece = await Piece.findByPk(req.params.id);
    if (!piece) {
      return res.status(404).json({
        status: "error",
        message: "Pièce non trouvée",
      });
    }

    res.status(200).json({
      status: "success",
      data: { piece },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération de la pièce",
      error: err.message,
    });
  }
};

exports.createPiece = async (req, res) => {
  try {
    const { name, reference, description, price, category_id, fournisseur_id } =
      req.body;
    const image = req.file ? `/uploads/pieces/${req.file.filename}` : null;

    const newPiece = await Piece.create({
      name,
      reference,
      description,
      price,
      image,
      category_id,
      fournisseur_id,
    });

    res.status(201).json({
      status: "success",
      data: { piece: newPiece },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Erreur lors de la création de la pièce",
      error: err.message,
    });
  }
};

exports.updatePiece = async (req, res) => {
  try {
    const piece = await Piece.findByPk(req.params.id);
    if (!piece) {
      return res.status(404).json({
        status: "error",
        message: "Pièce non trouvée",
      });
    }

    const updates = req.body;

    if (req.file) {
      updates.image = `/uploads/pieces/${req.file.filename}`;

      // Supprimer l'ancienne image si elle existe
      if (piece.image) {
        const oldImagePath = path.join(__dirname, "../public", piece.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await piece.update(updates);

    res.status(200).json({
      status: "success",
      data: { piece },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Erreur lors de la mise à jour de la pièce",
      error: err.message,
    });
  }
};

exports.deletePiece = async (req, res) => {
  try {
    const piece = await Piece.findByPk(req.params.id);
    if (!piece) {
      return res.status(404).json({
        status: "error",
        message: "Pièce non trouvée",
      });
    }

    // Supprimer l'image associée si elle existe
    if (piece.image) {
      const imagePath = path.join(__dirname, "../public", piece.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await piece.destroy();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la suppression de la pièce",
      error: err.message,
    });
  }
};

exports.uploadPieceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez télécharger une image",
      });
    }

    const piece = await Piece.findByPk(req.params.id);
    if (!piece) {
      return res.status(404).json({
        status: "error",
        message: "Pièce non trouvée",
      });
    }

    // Supprimer l'ancienne image
    if (piece.image) {
      const oldImagePath = path.join(__dirname, "../public", piece.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour l'image
    const newImagePath = `/uploads/pieces/${req.file.filename}`;
    await piece.update({ image: newImagePath });

    res.status(200).json({
      status: "success",
      data: { piece },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Erreur lors du téléchargement de l'image",
      error: err.message,
    });
  }
};
