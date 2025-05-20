const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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
app.use("/api/pieces", require("./routes/pieceRoutes"));
app.use("/api/categories", require("./routes/categorieRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/fournisseurs", require("./routes/fournisseurRoutes"));
app.use("/api/commandes", require("./routes/commandeRoutes"));
app.use("/api/factures", require("./routes/factureRoutes"));
app.use("/api/details", require("./routes/detailsCommandeRoutes"));
app.use("/api/vehicules", require("./routes/vehiculeRoutes"));
app.use("/api/stocks", require("./routes/stockRoutes"));
app.use("/api/pieceVehicule", require("./routes/pieceVehiculeRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Route d'accueil
app.get("/", (req, res) => {
  res.send("🚀 API de gestion de pièces de véhicules en ligne !");
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé. Veuillez réessayer.");
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`)
);
