// models/User.js
const db = require("../config/db"); // Connexion avec la version promesse de mysql2

const User = {
  // Trouver un utilisateur par email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0]; // Retourne le premier utilisateur trouvé
    } catch (error) {
      throw new Error("Erreur lors de la recherche de l'utilisateur");
    }
  },

  // Trouver un utilisateur par ID
  findById: async (id) => {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0]; // Retourne l'utilisateur correspondant
    } catch (error) {
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  },

  // Récupérer tous les utilisateurs (sans mot de passe)
  getAll: async () => {
    try {
      const [rows] = await db.query(
        "SELECT id, firstName, lastName, email, role FROM users"
      );
      return rows;
    } catch (error) {
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }
  },

  // Créer un utilisateur
  create: async ({ firstName, lastName, email, password, role }) => {
    try {
      const [result] = await db.query(
        "INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, password, role]
      );
      return {
        id: result.insertId,
        firstName,
        lastName,
        email,
        role,
      };
    } catch (error) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
  },

  // Comparer les mots de passe
  comparePasswords: async (inputPassword, storedPassword) => {
    // Logique pour comparer les mots de passe (par exemple, bcrypt.compare)
    return inputPassword === storedPassword; // Remplacez par votre logique de comparaison
  },

  // Mettre à jour un utilisateur
  update: async (id, { firstName, lastName, email, password, role }) => {
    try {
      const [result] = await db.query(
        "UPDATE users SET firstName = ?, lastName = ?, email = ?, password = ?, role = ? WHERE id = ?",
        [firstName, lastName, email, password, role, id]
      );
      return {
        id,
        firstName,
        lastName,
        email,
        role,
      };
    } catch (error) {
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  },
};

module.exports = User;
