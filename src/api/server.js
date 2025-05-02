const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config();

const app = express();

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Middleware pour gérer les requêtes CORS
app.use(cors());

app.use(express.urlencoded({ extended: true }));

// Tester la connexion à la base
db.getConnection()
  .then((conn) => {
    console.log("✅ Connexion pool MySQL prêt (mysql2/promise)");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Impossible de se connecter à la base de données:", err);
    process.exit(1);
  });

// Routes API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categorieRoutes"));
app.use("/api/pieces", require("./routes/pieceRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/fournisseurs", require("./routes/fournisseurRoutes"));
app.use("/api/commandes", require("./routes/commandeRoutes"));
app.use("/api/factures", require("./routes/factureRoutes"));
app.use("/api/details", require("./routes/detailsCommandeRoutes"));
app.use("/api/vehicules", require("./routes/vehiculeRoutes"));
app.use("/api/stocks", require("./routes/stockRoutes"));
app.use("/api/pieceVehicule", require("./routes/pieceVehiculeRoutes"));

app.use("/uploads", express.static("uploads"));

// Route pour tester la connexion
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.status(200).json({
      message: "Connexion à la base de données réussie !",
      result: rows[0].result,
    });
  } catch (err) {
    console.error("❌ Erreur lors du test de connexion :", err.message);
    res
      .status(500)
      .json({ message: "Erreur de connexion à la base de données." });
  }
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur serveur interne." });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`)
);
