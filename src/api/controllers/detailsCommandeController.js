const DetailsCommande = require('../models/detailsCommandeModel');

exports.getDetailsByCommandeId = (req, res) => {
  const commande_id = req.params.commandeId;
  DetailsCommande.getByCommandeId(commande_id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.addDetail = (req, res) => {
  const { commande_id, piece_id, quantity, price } = req.body;
  if (!commande_id || !piece_id || !quantity || !price) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  DetailsCommande.add({ commande_id, piece_id, quantity, price }, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Détail ajouté avec succès", id: result.insertId });
  });
};

exports.updateDetail = (req, res) => {
  const id = req.params.id;
  const { quantity, price } = req.body;

  if (!quantity || !price) {
    return res.status(400).json({ error: "Quantité et prix sont requis." });
  }

  DetailsCommande.update(id, { quantity, price }, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Détail mis à jour" });
  });
};

exports.deleteDetail = (req, res) => {
  const id = req.params.id;
  DetailsCommande.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Détail supprimé" });
  });
};
