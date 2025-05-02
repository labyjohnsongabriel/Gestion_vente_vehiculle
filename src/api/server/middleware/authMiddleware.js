// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Récupérer le token du header Authorization

  if (!token) {
    return res.status(403).json({ message: "Accès refusé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajouter les informations de l'utilisateur décodées à la requête
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

module.exports = authMiddleware;
