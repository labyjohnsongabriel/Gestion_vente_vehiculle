const pool = require("../config/db"); // Assuming you have a database connection pool

/**
 * Récupère les détails d'une commande spécifique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getDetailsByCommandeId = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const query = `
      SELECT dc.id, dc.commande_id, dc.piece_id, dc.quantity, dc.price,
             p.name as piece_name
      FROM details_commande dc
      LEFT JOIN pieces p ON dc.piece_id = p.id
      WHERE dc.commande_id = ?
    `;

    const [details] = await pool.query(query, [commandeId]);

    res.json(details);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de commande:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des détails" });
  }
};

/**
 * Ajoute un nouveau détail à une commande
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.addDetail = async (req, res) => {
  try {
    const { commande_id, piece_id, quantity, price } = req.body;

    // Validation des données
    if (!commande_id || !piece_id || !quantity || !price) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const query = `
      INSERT INTO details_commande (commande_id, piece_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      commande_id,
      piece_id,
      quantity,
      price,
    ]);

    // Mettre à jour le montant total de la commande
    await updateCommandeTotalAmount(commande_id);

    res.status(201).json({
      id: result.insertId,
      commande_id,
      piece_id,
      quantity,
      price,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du détail de commande:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'ajout du détail" });
  }
};

/**
 * Met à jour les détails d'une commande existante
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { piece_id, quantity, price } = req.body;

    // Récupérer l'ID de la commande avant la mise à jour
    const [detailRows] = await pool.query(
      "SELECT commande_id FROM details_commande WHERE id = ?",
      [id]
    );

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "Détail de commande non trouvé" });
    }

    const commande_id = detailRows[0].commande_id;

    // Mettre à jour le détail
    const query = `
      UPDATE details_commande
      SET piece_id = ?, quantity = ?, price = ?
      WHERE id = ?
    `;

    await pool.query(query, [piece_id, quantity, price, id]);

    // Mettre à jour le montant total de la commande
    await updateCommandeTotalAmount(commande_id);

    res.json({
      id: parseInt(id),
      commande_id,
      piece_id,
      quantity,
      price,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du détail de commande:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du détail" });
  }
};

/**
 * Supprime un détail de commande
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'ID de la commande avant la suppression
    const [detailRows] = await pool.query(
      "SELECT commande_id FROM details_commande WHERE id = ?",
      [id]
    );

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "Détail de commande non trouvé" });
    }

    const commande_id = detailRows[0].commande_id;

    // Supprimer le détail
    await pool.query("DELETE FROM details_commande WHERE id = ?", [id]);

    // Mettre à jour le montant total de la commande
    await updateCommandeTotalAmount(commande_id);

    res.json({ message: "Détail de commande supprimé avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du détail de commande:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du détail" });
  }
};

/**
 * Fonction utilitaire pour mettre à jour le montant total d'une commande
 * @param {number} commandeId - ID de la commande
 */
async function updateCommandeTotalAmount(commandeId) {
  try {
    // Calculer le montant total basé sur les détails
    const [totalResult] = await pool.query(
      `
      SELECT SUM(quantity * price) as total
      FROM details_commande
      WHERE commande_id = ?
    `,
      [commandeId]
    );

    const totalAmount = totalResult[0].total || 0;

    // Mettre à jour le montant dans la table commandes
    await pool.query(
      `
      UPDATE commandes
      SET montant = ?
      WHERE id = ?
    `,
      [totalAmount, commandeId]
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du montant total:", error);
    throw error;
  }
}
