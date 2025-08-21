const Vente = require("../models/venteModel");

exports.getAll = async (req, res) => {
  try {
    const ventes = await Vente.getAll();
    res.json(ventes);
  } catch (err) {
    console.error("Erreur getAll ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.getById = async (req, res) => {
  try {
    const vente = await Vente.getById(req.params.id);
    if (!vente) {
      return res.status(404).json({ error: "Vente non trouvée" });
    }
    res.json(vente);
  } catch (err) {
    console.error("Erreur getById vente:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const id = await Vente.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    console.error("Erreur create vente:", err);
    res.status(400).json({ error: err.message || "Erreur de création" });
  }
};

exports.update = async (req, res) => {
  try {
    const success = await Vente.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: "Vente non trouvée" });
    }
    res.json({ success });
  } catch (err) {
    console.error("Erreur update vente:", err);
    res.status(400).json({ error: err.message || "Erreur de modification" });
  }
};

exports.delete = async (req, res) => {
  try {
    const success = await Vente.delete(req.params.id);
    res.json({ success });
  } catch (err) {
    console.error("Erreur delete vente:", err);
    res.status(500).json({ error: err.message || "Erreur suppression" });
  }
};

exports.count = async (req, res) => {
  try {
    const count = await Vente.count();
    res.json({ count });
  } catch (err) {
    console.error("Erreur count ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};
{
  /**const Vente = require("../models/venteModel");

exports.getAll = async (req, res) => {
  try {
    const ventes = await Vente.getAll();
    res.json(ventes);
  } catch (err) {
    console.error("Erreur getAll ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.getById = async (req, res) => {
  try {
    const vente = await Vente.getById(req.params.id);
    if (!vente) {
      return res.status(404).json({ error: "Vente non trouvée" });
    }
    res.json(vente);
  } catch (err) {
    console.error("Erreur getById vente:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const id = await Vente.create(req.body);
    res.status(201).json({ id, message: "Vente créée avec succès" });
  } catch (err) {
    console.error("Erreur create vente:", err);
    res.status(400).json({ error: err.message || "Erreur de création" });
  }
};

exports.update = async (req, res) => {
  try {
    const success = await Vente.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: "Vente non trouvée" });
    }
    res.json({ success: true, message: "Vente modifiée avec succès" });
  } catch (err) {
    console.error("Erreur update vente:", err);
    res.status(400).json({ error: err.message || "Erreur de modification" });
  }
};

exports.delete = async (req, res) => {
  try {
    const success = await Vente.delete(req.params.id);
    res.json({ success, message: "Vente supprimée avec succès" });
  } catch (err) {
    console.error("Erreur delete vente:", err);
    res.status(500).json({ error: err.message || "Erreur suppression" });
  }
};

exports.count = async (req, res) => {
  try {
    const count = await Vente.count();
    res.json({ count });
  } catch (err) {
    console.error("Erreur count ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.countThisMonth = async (req, res) => {
  try {
    const count = await Vente.countThisMonth();
    res.json({ count });
  } catch (err) {
    console.error("Erreur countThisMonth ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.countLastMonth = async (req, res) => {
  try {
    const count = await Vente.countLastMonth();
    res.json({ count });
  } catch (err) {
    console.error("Erreur countLastMonth ventes:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.chiffreAffaires = async (req, res) => {
  try {
    const total = await Vente.chiffreAffaires();
    res.json({ total });
  } catch (err) {
    console.error("Erreur chiffreAffaires:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.statsMensuelles = async (req, res) => {
  try {
    const { year } = req.query;
    const stats = await Vente.statsMensuelles(year ? parseInt(year) : null);
    res.json(stats);
  } catch (err) {
    console.error("Erreur statsMensuelles:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.statsParJour = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await Vente.statsParJour(parseInt(days));
    res.json(stats);
  } catch (err) {
    console.error("Erreur statsParJour:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.topPieces = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topPieces = await Vente.topPieces(parseInt(limit));
    res.json(topPieces);
  } catch (err) {
    console.error("Erreur topPieces:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};

exports.topClients = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topClients = await Vente.topClients(parseInt(limit));
    res.json(topClients);
  } catch (err) {
    console.error("Erreur topClients:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
};
 */
}