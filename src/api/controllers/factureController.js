const Facture = require("../models/factureModel");

exports.getAllFactures = (req, res) => {
  Facture.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getFactureById = (req, res) => {
  Facture.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Facture non trouvée" });
    res.json(result[0]);
  });
};

exports.createFacture = (req, res) => {
  const { commande_id, total } = req.body;

  if (!commande_id || !total) {
    return res.status(400).json({ error: "Commande et total sont requis." });
  }

  Facture.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Facture créée avec succès", id: result.insertId });
  });
};

exports.deleteFacture = (req, res) => {
  Facture.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Facture supprimée avec succès" });
  });
};
