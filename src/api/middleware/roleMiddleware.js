module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès interdit",
        details: "Vous n'avez pas la permission d'accéder à cette ressource.",
      });
    }
    next();
  };
};
