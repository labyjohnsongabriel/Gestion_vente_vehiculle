// server/config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier uploads/avatars s'il n'existe pas
const uploadDir = path.join(__dirname, "../public/uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nettoyer le nom original (retirer les espaces spéciaux/danger)
    const cleanName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// Filtrage des fichiers (acceptation uniquement d'images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "avatar"), false);
  }
};

// Création de l'instance de multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter,
});

module.exports = upload;
