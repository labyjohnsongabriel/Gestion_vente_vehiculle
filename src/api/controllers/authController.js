// controllers/adminUserController.js
const AdminUser = require("../models/User");
const jwt = require("jsonwebtoken"); // Pour générer des tokens JWT pour la gestion de la session

const authController = {
  // Inscription d'un nouvel utilisateur
  register: (req, res) => {
    const { nom, email, password } = req.body;
    const newUser = { nom, email, password };

    AdminUser.create(newUser, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de l'enregistrement de l'utilisateur",
        });
      }
      res
        .status(201)
        .json({ message: "Utilisateur enregistré avec succès", result });
    });
  },

  // Connexion de l'utilisateur
  login: (req, res) => {
    const { email, password } = req.body;

    AdminUser.login(email, password, (err, user) => {
      if (err || !user) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        "secretKey",
        { expiresIn: "1h" }
      );
      res.status(200).json({ message: "Connexion réussie", token });
    });
  },
};

module.exports = authController;
