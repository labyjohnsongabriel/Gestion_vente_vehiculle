
const jwt = require("jsonwebtoken");



module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // Récupérer le header Authorization

    console.log("✅ Header Authorization reçu :", req.headers.authorization);

    if (!authHeader) {
      console.warn("❌ En-tête Authorization manquant");
      return res.status(401).json({
        error: "Accès refusé",
        details: "Le header 'Authorization' est requis (format Bearer TOKEN).",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.warn("❌ Format d'en-tête incorrect :", authHeader);
      return res.status(401).json({
        error: "Format du token invalide",
        details: "Le token doit commencer par 'Bearer ' suivi du JWT.",
      });
    }

    const token = authHeader.split(" ")[1]; // Extraire le token

    if (!token || token === "null" || token === "undefined") {
      console.warn("❌ Token invalide ou manquant :", token);
      return res.status(401).json({
        error: "Token requis",
        details: "Le token JWT est obligatoire pour accéder à cette ressource.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token
    req.user = decoded; // Ajouter les informations de l'utilisateur décodées à la requête
    next();
  } catch (error) {
    console.error("❌ Erreur JWT :", error.name, "-", error.message);

    const errorsMap = {
      TokenExpiredError: {
        status: 401,
        message: "Token expiré. Veuillez vous reconnecter.",
      },
      JsonWebTokenError: {
        status: 401,
        message: "Token invalide ou corrompu.",
      },
      NotBeforeError: {
        status: 401,
        message: "Le token n'est pas encore actif.",
      },
    };

    
    const customError = errorsMap[error.name] || {
      status: 500,
      message: "Erreur interne du serveur.",
    };

    return res.status(customError.status).json({
      error: customError.message,
      details: error.message,
    });
  }
};
