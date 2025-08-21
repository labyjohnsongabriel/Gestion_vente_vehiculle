const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Middleware d'upload pour l'avatar
 */
const AVATAR_DIR = path.join(__dirname, "../../../uploads/avatars");
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
exports.avatarUpload = multer({ storage });

/**
 * Récupérer tous les utilisateurs
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    // Exclure les mots de passe des résultats
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Enregistrer un nouvel utilisateur
 */
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation des champs requis
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont requis",
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'enregistrement" });
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Créer l'objet utilisateur sans le mot de passe
    const userData = {
      id: user.id || user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: user.role || (user.isAdmin ? "admin" : "user"),
      createdAt: user.createdAt,
    };

    res.json(userData);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } =
      req.body;
    const userId = req.user.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (
        existingUser &&
        (existingUser.id || existingUser._id).toString() !== userId.toString()
      ) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
    }

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;

    // Gestion du mot de passe
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Mot de passe actuel incorrect",
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "Le nouveau mot de passe doit contenir au moins 6 caractères",
        });
      }
      updateFields.password = await bcrypt.hash(newPassword, 12);
    } else if (currentPassword || newPassword) {
      return res.status(400).json({
        message:
          "Les deux mots de passe (actuel et nouveau) sont requis pour changer le mot de passe",
      });
    }

    // Gestion de l'avatar
    if (req.file) {
      updateFields.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await User.update(userId, updateFields);
    user = await User.findById(userId);

    // Retirer le mot de passe de la réponse
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Mettre à jour l'avatar de l'utilisateur connecté
 */
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await User.update(userId, { avatar: avatarPath });
    const user = await User.findById(userId);
    const { password, ...userWithoutPassword } = user;
    res.json({
      message: "Avatar mis à jour avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Supprimer un utilisateur (pour les admins)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    await User.delete(id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
