const db = require("../config/db");

// ✅ Nouvelle méthode pour les stats de dashboard (utilise vos tables existantes)
exports.getStockStats = async (req, res) => {
  try {
    // 1. Compte total (utilise votre méthode existante)
    const [countRows] = await db.query("SELECT COUNT(*) AS count FROM stocks");

    // 2. Quantité totale (nouvelle requête mais sans DB changes)
    const [quantityRows] = await db.query(
      "SELECT SUM(quantity) AS total FROM stocks"
    );

    // 3. Variation mensuelle (approximation basée sur la date de modification)
    const [changeRows] = await db.query(`
      SELECT 
        (SELECT SUM(quantity) FROM stocks WHERE updated_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) as current_month,
        (SELECT SUM(quantity) FROM stocks WHERE updated_at BETWEEN 
          DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') 
          AND LAST_DAY(NOW() - INTERVAL 1 MONTH)
        ) as previous_month
    `);

    const percentageChange = changeRows[0].previous_month
      ? ((changeRows[0].current_month - changeRows[0].previous_month) /
          changeRows[0].previous_month) *
        100
      : 0;

    res.status(200).json({
      totalItems: countRows[0].count,
      totalQuantity: quantityRows[0].total || 0,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
    });
  } catch (err) {
    console.error("[getStockStats] Error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getStockHistory = async (req, res) => {
  try {
    const stockId = req.params.id;
    if (!stockId || isNaN(Number(stockId))) {
      return res.status(400).json({ error: "ID de stock invalide." });
    }
    const [rows] = await db.query(
      "SELECT * FROM stock_history WHERE stock_id = ? ORDER BY created_at DESC",
      [stockId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("[getStockHistory] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique du stock.",
    });
  }
};

// Get stock trends (MySQL version)
exports.getStockTrends = async (req, res) => {
  try {
    const stockId = req.params.id;
    if (!stockId || isNaN(Number(stockId))) {
      return res.status(400).json({ error: "ID de stock invalide." });
    }
    // Group by date, get last quantity and min_quantity for each day
    const [rows] = await db.query(
      `
      SELECT 
        DATE(created_at) as date,
        SUBSTRING_INDEX(GROUP_CONCAT(new_quantity ORDER BY created_at DESC), ',', 1) as quantity,
        SUBSTRING_INDEX(GROUP_CONCAT(min_quantity ORDER BY created_at DESC), ',', 1) as min_quantity
      FROM stock_history
      WHERE stock_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      LIMIT 30
      `,
      [stockId]
    );
    const trends = rows.map((row) => ({
      date: row.date,
      quantity: Number(row.quantity),
      min_quantity:
        row.min_quantity !== undefined ? Number(row.min_quantity) : undefined,
    }));
    res.status(200).json(trends);
  } catch (err) {
    console.error("[getStockTrends] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur lors de la récupération des tendances du stock.",
    });
  }
};

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

// ✅ Ajuster un stock
exports.adjustStock = async (req, res) => {
  const stockId = req.params.id;
  const { adjustment, reason, user_id = null } = req.body;

  if (!stockId || isNaN(Number(stockId))) {
    return res.status(400).json({ error: "ID de stock invalide." });
  }
  if (typeof adjustment !== "number") {
    return res.status(400).json({ error: "Ajustement invalide." });
  }

  try {
    // Get current stock
    const [stockRows] = await db.query(
      "SELECT quantity, min_quantity FROM stocks WHERE id = ?",
      [stockId]
    );
    if (stockRows.length === 0) {
      return res.status(404).json({ error: "Stock non trouvé." });
    }
    const currentQuantity = stockRows[0].quantity;
    const min_quantity = stockRows[0].min_quantity || 0;
    const newQuantity = currentQuantity + adjustment;

    // Update stock
    await db.query("UPDATE stocks SET quantity = ? WHERE id = ?", [
      newQuantity,
      stockId,
    ]);

    // Insert into stock_history
    await db.query(
      "INSERT INTO stock_history (stock_id, `change`, new_quantity, min_quantity, reason, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [stockId, adjustment, newQuantity, min_quantity, reason || null, user_id]
    );

    res.status(200).json({ message: "Stock ajusté avec succès.", newQuantity });
  } catch (err) {
    console.error("[adjustStock] Erreur:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajustement du stock." });
  }
};
