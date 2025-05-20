const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads/pieces");

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers JPEG, PNG et WebP sont autorisés"), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("image");

// Contrôleur pour l'upload
exports.uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("[uploadImage] Erreur:", err.message);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "La taille du fichier ne doit pas dépasser 5MB",
        });
      }

      if (err.message.includes("autorisés")) {
        return res.status(400).json({
          status: "error",
          message: "Seuls les fichiers JPEG, PNG et WebP sont autorisés",
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Erreur lors de l'upload de l'image",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Aucun fichier téléchargé",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Image uploadée avec succès",
      imageUrl: `/uploads/pieces/${req.file.filename}`,
    });
  });
};
