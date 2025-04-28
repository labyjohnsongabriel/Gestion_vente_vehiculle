const Commande = require("../models/commandeModel");

exports.getAllCommandes = (req, res) => {
  Commande.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getCommandeById = (req, res) => {
  Commande.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.createCommande = (req, res) => {
  const { client_id, user_id } = req.body;

  if (!client_id || !user_id) {
    return res.status(400).json({ error: "Client et utilisateur sont requis." });
  }

  Commande.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Commande créée avec succès", id: result.insertId });
  });
};

exports.updateCommande = (req, res) => {
  const id = req.params.id;

  Commande.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Commande mise à jour avec succès" });
  });
};

exports.deleteCommande = (req, res) => {
  const id = req.params.id;

  Commande.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Commande supprimée avec succès" });
  });
};
