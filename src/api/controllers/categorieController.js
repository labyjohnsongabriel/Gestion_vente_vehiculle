const db = require("../config/db"); // Assurez-vous que votre fichier de configuration est correctement importé

// ✅ Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Récupérer une catégorie par ID
exports.getCategorieById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Créer une nouvelle catégorie
exports.createCategorie = async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "Le nom de la catégorie est requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name.trim(), description || null]
    );
    res
      .status(201)
      .json({ message: "Catégorie créée avec succès", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mettre à jour une catégorie
exports.updateCategorie = async (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "Le nom de la catégorie est requis." });
  }

  try {
    const [result] = await db.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description || null, id] // Description peut être null si non fournie
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.json({ message: "Catégorie mise à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Supprimer une catégorie
exports.deleteCategorie = async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
