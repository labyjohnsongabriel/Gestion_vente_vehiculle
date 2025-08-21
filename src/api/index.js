const express = require("express");
const app = express();

app.use(express.json());

// Servir les images statiques
app.use("/uploads", express.static(__dirname + "/../../uploads"));

module.exports = app;
