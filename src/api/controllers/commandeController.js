const Commande = require("../models/commandeModel");

// ✅ Récupérer toutes les commandes
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.getAll();
    res.json(commandes);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des commandes :",
      err.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des commandes." });
  }
};

// ✅ Récupérer une commande par ID
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.getById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json(commande);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération de la commande :",
      err.message
    );
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la récupération de la commande.",
      });
  }
};

// ✅ Créer une nouvelle commande
exports.createCommande = async (req, res) => {
  console.log("Corps de la requête :", req.body);

  const { client_id, user_id } = req.body;

  if (!client_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Le client et l'utilisateur sont requis." });
  }

  try {
    const id = await Commande.create(req.body);
    res.status(201).json({ message: "Commande créée avec succès", id });
  } catch (err) {
    console.error("Erreur lors de la création de la commande :", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création de la commande." });
  }
};

// ✅ Mettre à jour une commande
exports.updateCommande = async (req, res) => {
  const id = req.params.id;
  const { client_id, user_id } = req.body;

  if (!client_id || !user_id) {
    return res
      .status(400)
      .json({ error: "Le client et l'utilisateur sont requis." });
  }

  try {
    const affectedRows = await Commande.update(id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json({ message: "Commande mise à jour avec succès" });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de la commande :",
      err.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour de la commande." });
  }
};

// ✅ Supprimer une commande
exports.deleteCommande = async (req, res) => {
  const id = req.params.id;

  try {
    const affectedRows = await Commande.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    console.error(
      "Erreur lors de la suppression de la commande :",
      err.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression de la commande." });
  }
};
