const Vehicule = require('../models/vehiculeModel');

exports.getAllVehicules = (req, res) => {
  Vehicule.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getVehiculeById = (req, res) => {
    Vehicule.getById(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) return res.status(404).json({ message: "Véhicule non trouvée" });
      res.json(result[0]);
    });
  };

  exports.createVehicule = (req, res) => {
    const { marque, modele, immatriculation, annee, kilometrage } = req.body;
    
    if (!marque || !modele || !immatriculation || !annee || ! kilometrage){
        return res.status(400).json({ error:"Tous les champs sont requis."});
    }

    Vehicule.create(req.body, (err, result) =>{
        if( err) return

      res.status(500).json({ error: err });
      res.status(201).json({ message: "Vehicule ajouté avec succès", id: result.insertId});
    });
  };

  exports.updateVehicule= (req, res) => {
    const id = req.params.id;
    Vehicule.update(id, req.body, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Vehicule mise à jour avec succès" });
    });
  };

  exports.deleteVehicule = (req, res) => {
    const id = req.params.id;
    Vehicule.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Pièce supprimée avec succès" });
    });
  };
