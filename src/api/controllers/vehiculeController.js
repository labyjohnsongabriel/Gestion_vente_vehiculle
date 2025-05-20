const db = require("../config/db");

// ✅ Récupérer tous les véhicules
exports.getAllVehicules = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM vehicules ORDER BY date_ajout DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("[getAllVehicules] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des véhicules.",
    });
  }
};

// ✅ Récupérer un véhicule par ID
exports.getVehiculeById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vehicules WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Véhicule non trouvé." });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("[getVehiculeById] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération du véhicule.",
    });
  }
};

exports.createVehicule = async (req, res) => {
  const requiredFields = [
    "marque",
    "modele",
    "immatriculation",
    "annee",
    "kilometrage",
    "type",
    "statut",
    "date_ajout",

  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Champs manquants",
      missingFields,
      message: "Tous les champs sont requis.",
    });
  }

  try {
    // Validation de l'immatriculation
    const immatRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    if (!immatRegex.test(req.body.immatriculation)) {
      return res.status(400).json({
        error: "Format d'immatriculation invalide",
        message: "Le format doit être AA-123-BB",
      });
    }

    const [result] = await db.query(`INSERT INTO vehicules SET ?`, [req.body]);

    const [newVehicule] = await db.query(
      "SELECT * FROM vehicules WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Véhicule ajouté avec succès.",
      data: newVehicule[0],
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Immatriculation déjà existante",
        message: "Un véhicule avec cette immatriculation existe déjà.",
      });
    }
    console.error("[createVehicule] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la création du véhicule.",
    });
  }
};

// ✅ Mettre à jour un véhicule
exports.updateVehicule = async (req, res) => {
  try {
    // Vérifier si le véhicule existe
    const [vehicule] = await db.query("SELECT * FROM vehicules WHERE id = ?", [
      req.params.id,
    ]);

    if (vehicule.length === 0) {
      return res.status(404).json({ message: "Véhicule non trouvé." });
    }

    // Validation de l'immatriculation si elle est modifiée
    if (
      req.body.immatriculation &&
      req.body.immatriculation !== vehicule[0].immatriculation
    ) {
      const immatRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
      if (!immatRegex.test(req.body.immatriculation)) {
        return res.status(400).json({
          error: "Format d'immatriculation invalide",
          message: "Le format doit être AA-123-BB",
        });
      }

      // Vérifier si la nouvelle immatriculation existe déjà
      const [existing] = await db.query(
        "SELECT id FROM vehicules WHERE immatriculation = ? AND id != ?",
        [req.body.immatriculation, req.params.id]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          error: "Immatriculation déjà utilisée",
          message: "Un autre véhicule utilise déjà cette immatriculation.",
        });
      }
    }

    const [result] = await db.query(`UPDATE vehicules SET ? WHERE id = ?`, [
      req.body,
      req.params.id,
    ]);

    // Récupérer le véhicule mis à jour
    const [updatedVehicule] = await db.query(
      "SELECT * FROM vehicules WHERE id = ?",
      [req.params.id]
    );

    res.status(200).json({
      message: "Véhicule mis à jour avec succès.",
      data: updatedVehicule[0],
    });
  } catch (err) {
    console.error("[updateVehicule] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour du véhicule.",
    });
  }
};

// ✅ Supprimer un véhicule
exports.deleteVehicule = async (req, res) => {
  try {
    // Vérifier d'abord si le véhicule existe
    const [vehicule] = await db.query("SELECT * FROM vehicules WHERE id = ?", [
      req.params.id,
    ]);

    if (vehicule.length === 0) {
      return res.status(404).json({ message: "Véhicule non trouvé." });
    }

    const [result] = await db.query("DELETE FROM vehicules WHERE id = ?", [
      req.params.id,
    ]);

    res.status(200).json({
      message: "Véhicule supprimé avec succès.",
      deletedVehicule: vehicule[0],
    });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Véhicule référencé",
        message:
          "Ce véhicule ne peut pas être supprimé car il est référencé dans d'autres données.",
      });
    }
    console.error("[deleteVehicule] Erreur:", err.message);
    res.status(500).json({
      error: "Erreur serveur lors de la suppression du véhicule.",
    });
  }
};
