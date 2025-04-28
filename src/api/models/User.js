// models/adminUserModel.js
const db = require("../config/db");
const bcrypt = require("bcryptjs"); // Pour sécuriser les mots de passe

const AdminUser = {
  // Ajouter un nouvel utilisateur (admin)
  create: (userData, callback) => {
    const { nom, email, password } = userData;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt); // Crypter le mot de passe

    const query =
      "INSERT INTO admin_users (nom, email, password) VALUES (?, ?, ?)";
    db.query(query, [nom, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'ajout de l'utilisateur:", err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  // Vérifier le login de l'utilisateur
  login: (email, password, callback) => {
    const query = "SELECT * FROM admin_users WHERE email = ?";
    db.query(query, [email], (err, result) => {
      if (err) {
        console.error(
          "❌ Erreur lors de la récupération de l'utilisateur:",
          err
        );
        return callback(err, null);
      }
      if (result.length === 0) {
        return callback(null, null); // Aucun utilisateur trouvé
      }

      // Vérifier le mot de passe
      const user = result[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return callback(null, null); // Mot de passe incorrect
      }
      callback(null, user); // Utilisateur trouvé et mot de passe valide
    });
  },
};

module.exports = AdminUser;
