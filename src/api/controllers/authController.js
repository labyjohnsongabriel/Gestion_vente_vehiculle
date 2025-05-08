const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../server/utils/email");
require("dotenv").config();

const authController = {
  // Enregistrer un nouvel utilisateur
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Cet email est déjà enregistré" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
      });

      const token = jwt.sign(
        { id: user.id, email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(201).json({ token, userId: user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // Récupérer le profil
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // Mettre à jour le profil
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      const updateData = { firstName, lastName, email, role };

      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await User.update(req.user.id, updateData);

      res.json({
        message: "Profil mis à jour avec succès",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // Mot de passe oublié
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(200).json({
          message:
            "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const passwordResetExpires = Date.now() + 3600000; // 1 heure

      user.passwordResetToken = passwordResetToken;
      user.passwordResetExpires = passwordResetExpires;
      await user.save({ validateBeforeSave: false });

      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour continuer :\n\n${resetURL}\n\nCe lien est valide pendant 1 heure.`;

      await sendEmail({
        email: user.email,
        subject: "Réinitialisation de votre mot de passe (1h)",
        message,
      });

      res.status(200).json({
        message:
          "Si un compte avec cet email existe, un lien de réinitialisation a été envoyé",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: "Token invalide ou expiré. Veuillez refaire une demande.",
        });
      }

      user.password = await bcrypt.hash(password, 12);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      await sendEmail({
        email: user.email,
        subject: "Confirmation de changement de mot de passe",
        message: "Votre mot de passe a été modifié avec succès.",
      });

      res.status(200).json({ message: "Mot de passe mis à jour avec succès!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
};

module.exports = authController;
