const Fournisseur = require("../models/fournisseurModel");

// 🔍 Tous les fournisseurs
exports.getAllFournisseurs = (req, res) => {
  Fournisseur.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 🔍 Fournisseur par ID
exports.getFournisseurById = (req, res) => {
  Fournisseur.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Fournisseur non trouvé" });
    res.json(result[0]);
  });
};

// ➕ Ajouter un fournisseur
exports.createFournisseur = (req, res) => {
  const { nom, adresse, telephone, email } = req.body;

  if (!nom || !telephone) {
    return res.status(400).json({ error: "Le nom et le téléphone sont requis." });
  }

  Fournisseur.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Fournisseur créé avec succès", id: result.insertId });
  });
};

// 🔁 Modifier un fournisseur
exports.updateFournisseur = (req, res) => {
  const id = req.params.id;

  Fournisseur.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Fournisseur mis à jour avec succès" });
  });
};

// ❌ Supprimer un fournisseur
exports.deleteFournisseur = (req, res) => {
  const id = req.params.id;

  Fournisseur.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Fournisseur supprimé avec succès" });
  });
};
