const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController"); // Assurez-vous d'importer correctement le contrôleur

router.get("/", categorieController.getAllCategories);          // GET /api/categories
router.get("/:id", categorieController.getCategorieById);      // GET /api/categories/:id
router.post("/", categorieController.createCategorie);         // POST /api/categories
router.put("/:id", categorieController.updateCategorie);       // PUT /api/categories/:id
router.delete("/:id", categorieController.deleteCategorie);    // DELETE /api/categories/:id


module.exports = router;
