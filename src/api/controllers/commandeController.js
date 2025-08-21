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
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des commandes.",
    });
  }
};

// ✅ Compter toutes les commandes
exports.getCommandesCount = async (req, res) => {
  try {
    const count = await Commande.count();
    res.json({ count });
  } catch (err) {
    console.error("Erreur lors du comptage des commandes :", err.message);
    res.status(500).json({
      error: "Erreur serveur lors du comptage des commandes.",
    });
  }
};

// ✅ Récupérer les statistiques des commandes
exports.getCommandesStats = async (req, res) => {
  try {
    const stats = await Commande.getStats();
    res.json(stats);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des statistiques :",
      err.message
    );
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des statistiques.",
    });
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
    res.status(500).json({
      error: "Erreur serveur lors de la récupération de la commande.",
    });
  }
};

// ✅ Créer une nouvelle commande
exports.createCommande = async (req, res) => {
  console.log("Corps de la requête :", req.body);

  const { client_id, user_id } = req.body;

  // Validation des champs requis
  if (!client_id || !user_id) {
    return res.status(400).json({
      error: "Le client et l'utilisateur sont requis.",
      details: {
        client_id: !client_id ? "Client ID manquant" : null,
        user_id: !user_id ? "User ID manquant" : null,
      },
    });
  }

  try {
    const id = await Commande.create(req.body);
    res.status(201).json({
      message: "Commande créée avec succès",
      id,
      data: { ...req.body, id },
    });
  } catch (err) {
    console.error("Erreur lors de la création de la commande :", err.message);

    // Gestion spécifique des erreurs de contrainte
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Client ou utilisateur inexistant.",
      });
    }

    res.status(500).json({
      error: "Erreur serveur lors de la création de la commande.",
    });
  }
};

// ✅ Mettre à jour une commande
exports.updateCommande = async (req, res) => {
  const id = req.params.id;
  const { client_id, user_id } = req.body;

  // Validation de l'ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      error: "ID de commande invalide.",
    });
  }

  // Validation des champs requis (si fournis)
  if (
    (client_id !== undefined && !client_id) ||
    (user_id !== undefined && !user_id)
  ) {
    return res.status(400).json({
      error: "Le client et l'utilisateur ne peuvent pas être vides.",
    });
  }

  try {
    const affectedRows = await Commande.update(id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Récupérer la commande mise à jour
    const updatedCommande = await Commande.getById(id);
    res.json({
      message: "Commande mise à jour avec succès",
      data: updatedCommande,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de la commande :",
      err.message
    );

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Client ou utilisateur inexistant.",
      });
    }

    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour de la commande.",
    });
  }
};

// ✅ Supprimer une commande
exports.deleteCommande = async (req, res) => {
  const id = req.params.id;

  // Validation de l'ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      error: "ID de commande invalide.",
    });
  }

  try {
    const affectedRows = await Commande.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json({
      message: "Commande supprimée avec succès",
      deletedId: id,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la suppression de la commande :",
      err.message
    );
    res.status(500).json({
      error: "Erreur serveur lors de la suppression de la commande.",
    });
  }
};

// ✅ Rechercher des commandes
exports.searchCommandes = async (req, res) => {
  try {
    const { query, status, date_debut, date_fin, client_id } = req.query;
    const commandes = await Commande.search({
      query,
      status,
      date_debut,
      date_fin,
      client_id,
    });
    res.json(commandes);
  } catch (err) {
    console.error("Erreur lors de la recherche des commandes :", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la recherche des commandes.",
    });
  }
};
