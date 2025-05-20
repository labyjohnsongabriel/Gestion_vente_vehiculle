import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import {
  Inventory,
  Add,
  Remove,
  Close,
  Save,
  Warning,
} from "@mui/icons-material";
import axios from "axios";

const StockForm = ({ open, onClose, refreshStocks, stockToEdit, userRole }) => {
  const [formData, setFormData] = useState({
    piece_id: "",
    piece_name: "",
    quantity: 0,
    min_quantity: 5,
    action: "create",
    change: 0,
    reason: "",
  });
  const [error, setError] = useState("");
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (stockToEdit) {
      setFormData({
        ...stockToEdit,
        action: "update",
        change: 0,
        reason: "",
      });
    } else {
      setFormData({
        piece_id: "",
        piece_name: "",
        quantity: 0,
        min_quantity: 5,
        action: "create",
        change: 0,
        reason: "",
      });
    }

    const fetchPieces = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pieces");
        setPieces(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des pièces", err);
      }
    };

    fetchPieces();
  }, [stockToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    const quantity = parseInt(value) || 0;

    setFormData((prev) => ({
      ...prev,
      quantity,
      change: stockToEdit ? quantity - prev.quantity : 0,
    }));
  };

  const handlePieceChange = (e) => {
    const pieceId = e.target.value;
    const selectedPiece = pieces.find((p) => p.id === pieceId);

    setFormData((prev) => ({
      ...prev,
      piece_id: pieceId,
      piece_name: selectedPiece ? selectedPiece.name : "",
    }));
  };

  const handleSubmit = async () => {
    try {
      setError("");

      if (!formData.piece_id) {
        setError("Veuillez sélectionner une pièce");
        return;
      }

      if (formData.action === "create") {
        await axios.post("http://localhost:5000/api/stocks", formData);
      } else {
        await axios.put(
          `http://localhost:5000/api/stocks/${formData.id}`,
          formData
        );
      }

      refreshStocks();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  const safePieces = Array.isArray(pieces) ? pieces : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Inventory />
        {stockToEdit ? "Modifier le Stock" : "Ajouter un Nouveau Stock"}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {!stockToEdit && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Pièce</InputLabel>
                <Select
                  value={formData.piece_id}
                  onChange={handlePieceChange}
                  label="Pièce"
                  required
                >
                  {safePieces.map((piece) => (
                    <MenuItem key={piece.id} value={piece.id}>
                      {piece.name} ({piece.reference})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantité"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Inventory />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantité minimale"
              type="number"
              name="min_quantity"
              value={formData.min_quantity}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Warning />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {stockToEdit && formData.change !== 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2">Modification:</Typography>
                <Chip
                  label={`${formData.change > 0 ? "+" : ""}${formData.change}`}
                  color={formData.change > 0 ? "success" : "error"}
                  icon={formData.change > 0 ? <Add /> : <Remove />}
                  size="small"
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Raison de la modification"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              multiline
              rows={2}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          startIcon={<Save />}
          variant="contained"
          color="primary"
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockForm;
