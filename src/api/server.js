const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // <-- Set your frontend URL here
    credentials: true, // nécessaire si tu utilises des cookies/sessions
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Ensure avatars upload directory exists
const avatarsDir = path.join(__dirname, "public/uploads/avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

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
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/pieceVehicule", require("./routes/pieceVehiculeRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/user/settings", require("./routes/userSettingsRoutes"));
app.use("/api/notifications", require("./routes/notificationsRoutes"));

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
