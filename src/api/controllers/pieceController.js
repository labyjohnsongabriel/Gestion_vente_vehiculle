const Piece = require('../models/pieceModel');

exports.getAllPieces = (req, res) => {
  Piece.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getPieceById = (req, res) => {
  Piece.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Pièce non trouvée" });
    res.json(result[0]);
  });
};

exports.createPiece = (req, res) => {
  const data = req.body;
  Piece.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Pièce ajoutée avec succès", id: result.insertId });
  });
};

exports.updatePiece = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Piece.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Pièce mise à jour" });
  });
};

exports.deletePiece = (req, res) => {
  const id = req.params.id;
  Piece.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Pièce supprimée" });
  });
};
