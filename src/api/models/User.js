const db = require("../config/db"); // Connexion avec mysql2/promise

const User = {
  // Trouver un utilisateur par email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error("Erreur lors de la recherche de l'utilisateur");
    }
  },

  // Trouver un utilisateur par ID
  findById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  },

  // Trouver un utilisateur par token de reset
  findByResetToken: async (token) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM users WHERE passwordResetToken = ? AND passwordResetExpires > ?",
        [token, new Date()]
      );
      return rows[0];
    } catch (error) {
      console.error("Erreur SQL findByResetToken:", error);
      throw new Error("Erreur lors de la recherche par token de reset");
    }
  },

  // Récupérer tous les utilisateurs (y compris avatar, sans mot de passe)
  getAll: async () => {
    try {
      const [rows] = await db.query(
        "SELECT id, firstName, lastName, email, role, avatar FROM users"
      );
      return rows;
    } catch (error) {
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }
  },

  // Créer un utilisateur
  create: async ({
    firstName,
    lastName,
    email,
    password,
    role,
    avatar = null,
  }) => {
    try {
      const [result] = await db.query(
        "INSERT INTO users (firstName, lastName, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
        [firstName, lastName, email, password, role, avatar]
      );
      return {
        id: result.insertId,
        firstName,
        lastName,
        email,
        role,
        avatar,
      };
    } catch (error) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
  },

  // Comparer les mots de passe
  comparePasswords: async (inputPassword, storedPassword) => {
    // À remplacer par bcrypt.compare si hashé
    return inputPassword === storedPassword;
  },

  // Mettre à jour un utilisateur
  update: async (id, updateFields) => {
    try {
      const user = await User.findById(id);
      if (!user) throw new Error("Utilisateur non trouvé");

      const {
        firstName = user.firstName,
        lastName = user.lastName,
        email = user.email,
        password = user.password,
        role = user.role,
        avatar = user.avatar,
      } = updateFields;

      const [result] = await db.query(
        "UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ?, avatar = ? WHERE id = ?",
        [firstName, lastName, email, password, role, avatar, id]
      );

      return {
        id,
        firstName,
        lastName,
        email,
        role,
        avatar,
      };
    } catch (error) {
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  },
};

module.exports = User;
