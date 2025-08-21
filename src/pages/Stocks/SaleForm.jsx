import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const SaleForm = ({
  open,
  onClose,
  stockId,
  stocks,
  onSale,
  refreshStocks,
}) => {
  const [saleData, setSaleData] = useState({
    piece_id: "",
    client_id: "",
    quantite: "",
    prix_unitaire: "",
    reduction: "0",
    prix_total: "",
    status: "complet",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [pieceId, setPieceId] = useState(""); // Nouvel état pour stocker le piece_id

  const selectedStock = stocks.find((stock) => stock.id === stockId);

  useEffect(() => {
    if (selectedStock) {
      // Récupérer le piece_id depuis le stock
      setPieceId(selectedStock.piece_id || selectedStock.pieceId);

      setSaleData((prev) => ({
        ...prev,
        quantite: prev.quantite || "1",
        prix_unitaire: selectedStock.price || "0",
        prix_total: (prev.quantite || 1) * selectedStock.price || "0",
      }));
    }
  }, [selectedStock, stockId]);

  useEffect(() => {
    if (selectedStock && saleData.quantite) {
      const quantite = parseInt(saleData.quantite) || 0;
      const reduction = parseFloat(saleData.reduction) || 0;
      const prixUnitaire = parseFloat(selectedStock.price) || 0;

      let prixTotal = quantite * prixUnitaire;
      if (reduction > 0) {
        prixTotal = prixTotal - (prixTotal * reduction) / 100;
      }

      setSaleData((prev) => ({
        ...prev,
        prix_total: prixTotal.toFixed(2),
      }));
    }
  }, [saleData.quantite, saleData.reduction, selectedStock]);

  useEffect(() => {
    // Charger les clients depuis l'API
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedStock) {
      setError("Stock non sélectionné");
      setLoading(false);
      return;
    }

    if (!pieceId) {
      setError("ID de pièce non trouvé");
      setLoading(false);
      return;
    }

    const quantite = parseInt(saleData.quantite);
    if (quantite <= 0 || isNaN(quantite)) {
      setError("La quantité doit être supérieure à 0");
      setLoading(false);
      return;
    }

    if (quantite > selectedStock.quantity) {
      setError(
        `Quantité insuffisante en stock. Disponible: ${selectedStock.quantity}`
      );
      setLoading(false);
      return;
    }

    if (!saleData.client_id) {
      setError("Veuillez sélectionner un client");
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API avec validation
      const saleDataForApi = {
        piece_id: parseInt(pieceId), // Utiliser piece_id au lieu de stockId
        client_id: parseInt(saleData.client_id),
        quantite: quantite,
        prix_unitaire: parseFloat(selectedStock.price),
        reduction: parseFloat(saleData.reduction) || 0,
        prix_total: parseFloat(saleData.prix_total),
        status: saleData.status,
        notes: saleData.notes || "",
      };

      console.log("Données envoyées à l'API:", saleDataForApi);

      // Appel à l'API pour enregistrer la vente
      const response = await axios.post(`${API_URL}/ventes`, saleDataForApi);

      // Mise à jour du stock
      await axios.patch(`${API_URL}/stocks/${stockId}`, {
        quantity: selectedStock.quantity - quantite,
      });

      // Appel de la fonction parente
      await onSale(saleDataForApi);
      await refreshStocks();

      onClose();
    } catch (error) {
      console.error("Erreur vente:", error);
      if (error.response?.data?.message) {
        setError(`Erreur: ${error.response.data.message}`);
        if (error.response.data.details) {
          console.error("Détails de l'erreur:", error.response.data.details);
        }
      } else {
        setError(
          "Erreur lors de la vente. Vérifiez la console pour plus de détails."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    setSaleData((prev) => ({
      ...prev,
      client_id: clientId,
    }));
  };

  if (!selectedStock) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Vendre {selectedStock.piece_name} (Stock ID: {stockId}, Piece ID:{" "}
        {pieceId})
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Quantité"
              name="quantite"
              type="number"
              value={saleData.quantite}
              onChange={handleChange}
              required
              inputProps={{
                min: 1,
                max: selectedStock.quantity,
              }}
              helperText={`Stock disponible: ${selectedStock.quantity}`}
              fullWidth
            />

            <TextField
              select
              label="Sélectionner un client"
              name="client_id"
              value={saleData.client_id}
              onChange={handleClientSelect}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>Sélectionner un client</em>
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.nom} - {client.email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Prix unitaire"
              name="prix_unitaire"
              value={selectedStock.price || "0"}
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
              fullWidth
            />

            <TextField
              label="Réduction (%)"
              name="reduction"
              type="number"
              value={saleData.reduction}
              onChange={handleChange}
              inputProps={{
                min: 0,
                max: 100,
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              fullWidth
            />

            <TextField
              label="Prix total"
              name="prix_total"
              value={
                saleData.prix_total
                  ? parseFloat(saleData.prix_total).toFixed(2)
                  : "0.00"
              }
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
              fullWidth
            />

            <TextField
              label="Statut"
              name="status"
              select
              value={saleData.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="complet">Complet</MenuItem>
              <MenuItem value="partiel">Partiel</MenuItem>
              <MenuItem value="annule">Annulé</MenuItem>
            </TextField>

            <TextField
              label="Notes (facultatif)"
              name="notes"
              multiline
              rows={3}
              value={saleData.notes}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !saleData.client_id || !saleData.quantite}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Traitement..." : "Confirmer la vente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SaleForm;
