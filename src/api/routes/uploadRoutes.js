const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configurez le dossier de destination et le nom du fichier
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  // Retourner le chemin relatif pour le frontend
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
