const Categorie = require('../models/categorieModel');

exports.getAllCategories = (req, res) => {
  Categorie.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getCategorieById = (req, res) => {
  Categorie.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Catégorie non trouvée" });
    res.json(result[0]);
  });
};
exports.createCategorie = (req, res) => {
    const { name, description } = req.body;
  
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le nom de la catégorie est requis." });
    }
  
    Categorie.create({ name: name.trim(), description }, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Catégorie créée avec succès", id: result.insertId });
    });
  };
  

exports.updateCategorie = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Categorie.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Catégorie mise à jour" });
  });
};

exports.deleteCategorie = (req, res) => {
  const id = req.params.id;
  Categorie.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Catégorie supprimée" });
  });
};
