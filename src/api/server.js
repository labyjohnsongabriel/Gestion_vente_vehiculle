const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// 🔗 Import des routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pieces', require('./routes/pieceRoutes'));
app.use('/api/categories', require('./routes/categorieRoutes')); // ✅ Correction ici
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/fournisseurs', require('./routes/fournisseurRoutes'));
app.use('/api/commandes', require('./routes/commandeRoutes'));
app.use('/api/factures', require('./routes/factureRoutes'));
app.use('/api/details', require('./routes/detailsCommandeRoutes'));
app.use('/api/vehicules',require('./routes/vehiculeRoutes'));
app.use('/api/stocks',require('./routes/stockRoutes'));
app.use('/api/piece_vehicule',require('./routes/pieceVehiculeRoutes'));


































const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
