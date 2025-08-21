const userRoutes = require('./routes/userRoutes');
const express = require("express");
const path = require("path");
const app = express();

app.use('/api/users', userRoutes);

// Sert les fichiers images statiques
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Gestion globale des erreurs Multer (à placer après toutes les routes)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Fichier trop volumineux (max 5MB)" });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = app;
