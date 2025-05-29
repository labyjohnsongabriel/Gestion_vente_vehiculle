const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionnel : charger l'utilisateur depuis la base
    req.user = { id: decoded.id }; // ou tout l'objet user si besoin
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
