const PieceVehicule = require("../models/pieceVehiculeModel");

exports.getAllAssociations = (req, res)  => {
  PieceVehicule.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getPiecesByVehicule = (req, res) => {
    const vehicule_id = req.params.vehiculeId;
     PieceVehicule.getByVehiculeId(vehicule_id, (err, results) => {
       if (err) return res.status(500).json({ error: err });
       if (results.length === 0) return res.status(404).json({ message: "Aucune pièce trouvée pour ce véhicule" });
       res.json(results);
     });
   };
 

   exports.createAssociation= (req, res) => {
    const { piece_id, vehicule_id } = req.body;
    
    if (!piece_id || !vehicule_id ){
        return res.status(400).json({ error:"les champs 'piece_id' et 'vehicule_id'sont requis."});
    }

 PieceVehicule.create({ piece_id, vehicule_id }, (err, result) => { if (err) return     
      res.status(500).json({ error: err });
      res.status(201).json({ message: "Association ajouté avec succès", id: result.insertId});
    });
  }
  exports.updateAssociation= (req, res) => {
    const id = req.params.id;
    const { piece_id, vehicule_id} = req.body;
      if (! piece_id || !vehicule_id){
        return res.status(400).json({ error: "Les champs 'piece_id' et 'vehicule_id' sont requis"});
      }
   
  PieceVehicule.update(id, { piece_id, vehicule_id}, (err) => {
    if (err) return
  res.status(500).json({ error: err });
      res.json({ message: "Association mise à jour avec succès" });
    });
  };

  
  exports.deleteAssociation = (req, res) => {
    const id = req.params.id;
    PieceVehicule.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Association supprimée avec succès" });
    });
  };
