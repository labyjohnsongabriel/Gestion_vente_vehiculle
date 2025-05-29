require("dotenv").config();

const express = require("express");
const app = express();
const userRoutes = require("./src/api/routes/userRoutes");

// Middleware pour parser le JSON
app.use(express.json());

// Montage du routeur avec le préfixe /api
app.use("/api", userRoutes);

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Erreur serveur !");
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});