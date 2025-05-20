const db = require("../config/db");

// ✅ Récupérer tous les stocks
exports.getAllStocks = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, piece_id, quantity FROM stocks");
    res.status(200).json(rows);
  } catch (err) {
    console.error("[getAllStocks] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des stocks." });
  }
};

// ✅ Récupérer un stock par ID de pièce
exports.getStockByPieceId = async (req, res) => {
  const { pieceId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, piece_id, quantity FROM stocks WHERE piece_id = ?",
      [pieceId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun stock trouvé pour cette pièce." });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("[getStockByPieceId] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération du stock." });
  }
};

// ✅ Créer un stock
exports.createStock = async (req, res) => {
  const { piece_id, quantity } = req.body;

  if (!piece_id || quantity == null) {
    return res
      .status(400)
      .json({ error: "Les champs 'piece_id' et 'quantity' sont requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO stocks (piece_id, quantity) VALUES (?, ?)",
      [piece_id, quantity]
    );
    res.status(201).json({
      message: "Stock ajouté avec succès.",
      stock: { id: result.insertId, piece_id, quantity },
    });
  } catch (err) {
    console.error("[createStock] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du stock." });
  }
};

// ✅ Mettre à jour un stock
exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity == null) {
    return res.status(400).json({ error: "Le champ 'quantity' est requis." });
  }

  try {
    const [result] = await db.query(
      "UPDATE stocks SET quantity = ? WHERE id = ?",
      [quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stock non trouvé." });
    }

    res.status(200).json({ message: "Stock mis à jour avec succès." });
  } catch (err) {
    console.error("[updateStock] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour du stock." });
  }
};

// ✅ Supprimer un stock
exports.deleteStock = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM stocks WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stock non trouvé." });
    }

    res.status(200).json({ message: "Stock supprimé avec succès." });
  } catch (err) {
    console.error("[deleteStock] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du stock." });
  }
};

// ✅ Compter les stocks
exports.getStockCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM stocks");
    res.status(200).json({ count: rows[0].count });
  } catch (err) {
    console.error("[getStockCount] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du comptage des stocks." });
  }
};
