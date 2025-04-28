const Client = require('../models/clientModel');

// 🔍 Récupérer tous les clients
exports.getAllClients = (req, res) => {
  Client.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 🔍 Récupérer un client par ID
exports.getClientById = (req, res) => {
  Client.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Client non trouvé" });
    res.json(result[0]);
  });
};

// ➕ Créer un nouveau client
exports.createClient = (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Les champs name, email et phone sont requis." });
  }

  Client.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Client ajouté avec succès", id: result.insertId });
  });
};

// 🔁 Mettre à jour un client
exports.updateClient = (req, res) => {
  const id = req.params.id;

  Client.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Client mis à jour avec succès" });
  });
};

// ❌ Supprimer un client
exports.deleteClient = (req, res) => {
  const id = req.params.id;

  Client.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Client supprimé avec succès" });
  });
};
