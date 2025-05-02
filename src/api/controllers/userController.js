const db = require("../config/db");

// ✅ Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email, role FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des utilisateurs :",
      err.message
    );
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la récupération des utilisateurs.",
      });
  }
};

// ✅ Récupérer les informations du profil
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userId = req.user.id;

    const [result] = await db.query(
      "UPDATE users SET firstName = ?, lastName = ?, email = ? WHERE id = ?",
      [firstName, lastName, email, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json({ message: "Profil mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mettre à jour l'avatar
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const avatarPath = req.file.path;

    await db.query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarPath,
      userId,
    ]);
    res.json({ message: "Avatar mis à jour avec succès.", avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
