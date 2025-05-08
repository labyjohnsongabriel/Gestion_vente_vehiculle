const express = require("express");
const categorieController = require("../controllers/categorieController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Routes publiques
router.get("/", categorieController.getAllCategories);
router.get("/:id", categorieController.getCategorieById);

// ✅ Routes protégées (authentification requise)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  categorieController.createCategorie
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categorieController.updateCategorie
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categorieController.deleteCategorie
);

module.exports = router;
