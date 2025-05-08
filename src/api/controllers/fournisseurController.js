const Fournisseur = require("../models/fournisseurModel");

// ✅ Récupérer tous les fournisseurs
exports.getAllFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.getAll();
    res.json(fournisseurs);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des fournisseurs :",
      err.message
    );
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des fournisseurs.",
    });
  }
};

// ✅ Récupérer un fournisseur par ID
exports.getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.getById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.json(fournisseur);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération du fournisseur :",
      err.message
    );
    res.status(500).json({
      error: "Erreur serveur lors de la récupération du fournisseur.",
    });
  }
};

// ✅ Créer un nouveau fournisseur
exports.createFournisseur = async (req, res) => {
  const { nom, adresse, telephone, email } = req.body || {};

  if (!nom || !email) {
    return res.status(400).json({ error: "Le nom et l'email sont requis." });
  }

  try {
    const id = await Fournisseur.create(req.body);
    res.status(201).json({ message: "Fournisseur créé avec succès", id });
  } catch (err) {
    console.error("Erreur lors de la création du fournisseur :", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du fournisseur." });
  }
};


// ✅ Mettre à jour un fournisseur
exports.updateFournisseur = async (req, res) => {
  const id = req.params.id;
  const { nom, adresse, telephone, email } = req.body;

  if (!nom || !email) {
    return res.status(400).json({ error: "Le nom et l'email sont requis." });
  }

  try {
    const affectedRows = await Fournisseur.update(id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.json({ message: "Fournisseur mis à jour avec succès" });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour du fournisseur :",
      err.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour du fournisseur." });
  }
};

// ✅ Supprimer un fournisseur
exports.deleteFournisseur = async (req, res) => {
  const id = req.params.id;

  try {
    const affectedRows = await Fournisseur.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    res.json({ message: "Fournisseur supprimé avec succès" });
  } catch (err) {
    console.error(
      "Erreur lors de la suppression du fournisseur :",
      err.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du fournisseur." });
  }
};
