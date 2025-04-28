const Stock = require("../models/stockModel");

exports.getAllStocks = (req, res)  => {
  Stock.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getStockByPieceId = (req, res) => {
   const piece_id = req.params.pieceId;
    Stock.getByPieceId(piece_id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) return res.status(404).json({ message: "Stock non trouvée pour cette pièce" });
      res.json(result[0]);
    });
  };

  exports.createStock = (req, res) => {
    const { piece_id, quantity } = req.body;
    
    if (!piece_id || quantity == null) {
        return res.status(400).json({ error:"les champs 'piece_id' et 'quantité' sont requis."});
    }

    Stock.create({ piece_id, quantity }, (err, result) =>{
        if( err) return
      res.status(500).json({ error: err });
      res.status(201).json({ message: "Stock ajouté avec succès", id: result.insertId});
    });
  };

  exports.updateStock= (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
   if (quantity == null) {
    return res.status(400).json({error: "Le champ 'quantité' est réquis."});
   }
    Stock.update(id, quantity, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Stock mise à jour avec succès" });
    });
  };


  exports.deleteStock = (req, res) => {
    const id = req.params.id;
    Stock.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Stock supprimée avec succès" });
    });
  };

