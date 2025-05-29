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
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import {
  Inventory,
  Add,
  Remove,
  Close,
  Save,
  Warning,
  Search as SearchIcon,
  Info,
} from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useDebounce } from "use-debounce";

const API_URL = "http://localhost:5000/api";

const StockForm = ({ open, onClose, refreshStocks, stockToEdit, userRole }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    piece_id: "",
    piece_name: "",
    piece_reference: "",

    quantity: 0,
    min_quantity: 5,
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [initialQuantity, setInitialQuantity] = useState(0);

  // Initialisation du formulaire
  useEffect(() => {
    if (stockToEdit) {
      setFormData({
        piece_id: stockToEdit.piece_id,
        piece_name: stockToEdit.piece_name || "",
        piece_reference: stockToEdit.piece_reference || "",

        quantity: stockToEdit.quantity,
        min_quantity: stockToEdit.min_quantity || 5,
        reason: "",
      });
      setInitialQuantity(stockToEdit.quantity);
    } else {
      setFormData({
        piece_id: "",
        piece_name: "",
        piece_reference: "",

        quantity: 0,
        min_quantity: 5,
        reason: "",
      });
      setInitialQuantity(0);
    }
    setErrors({});
    setSearchTerm("");
  }, [stockToEdit, open]);

  // Chargement initial des pièces
  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const response = await axios.get(`${API_URL}/pieces`);
        // Normalize response: if response.data.data exists, use it, else use response.data
        const piecesArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setPieces(piecesArray);
      } catch (error) {
        console.error("Error fetching pieces:", error);
        enqueueSnackbar("Erreur lors du chargement des pièces", {
          variant: "error",
        });
      }
    };

    if (open) {
      fetchPieces();
    }
  }, [open, enqueueSnackbar]);

  // Recherche des pièces avec debounce
  useEffect(() => {
    const searchPieces = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/pieces?search=${debouncedSearchTerm}`
        );
        // Normalize response: if response.data.data exists, use it, else use response.data
        const piecesArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setPieces(piecesArray);
      } catch (error) {
        console.error("Error searching pieces:", error);
      }
    };

    if (debouncedSearchTerm) {
      searchPieces();
    }
  }, [debouncedSearchTerm]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.piece_id) {
      newErrors.piece_id = "Une pièce doit être sélectionnée";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "La quantité ne peut pas être négative";
    }

    if (formData.min_quantity < 0) {
      newErrors.min_quantity = "La quantité minimum ne peut pas être négative";
    }

    if (
      stockToEdit &&
      formData.quantity !== initialQuantity &&
      !formData.reason.trim()
    ) {
      newErrors.reason = "Une raison est requise pour les ajustements de stock";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        piece_id: formData.piece_id,
        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        reason: formData.reason,
      };

      if (stockToEdit) {
        await axios.put(`${API_URL}/stocks/${stockToEdit.id}`, payload);
        enqueueSnackbar("Stock mis à jour avec succès", { variant: "success" });
      } else {
        await axios.post(`${API_URL}/stocks`, payload);
        enqueueSnackbar("Stock créé avec succès", { variant: "success" });
      }

      refreshStocks();
      onClose();
    } catch (err) {
      console.error("Error saving stock", err);
      const errorMessage =
        err.response?.data?.error ||
        "Une erreur s'est produite lors de la sauvegarde";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(0, formData.quantity + delta);
    setFormData((prev) => ({
      ...prev,
      quantity: newQuantity,
    }));
  };

  const handlePieceSelect = (_, value) => {
    if (value) {
      setFormData({
        piece_id: value.id,
        piece_name: value.name,
        piece_reference: value.reference || "",

        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        reason: formData.reason,
      });
    } else {
      setFormData({
        piece_id: "",
        piece_name: "",
        piece_reference: "",
        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        reason: formData.reason,
      });
    }
    setErrors((prev) => ({ ...prev, piece_id: "" }));
  };

  const selectedPiece = Array.isArray(pieces)
    ? pieces.find((p) => p.id === formData.piece_id) || null
    : null;

  const getStockStatus = () => {
    if (formData.quantity <= 0)
      return { label: "Rupture de stock", color: "error" };
    if (formData.quantity <= formData.min_quantity)
      return { label: "Stock bas", color: "warning" };
    return { label: "En stock", color: "success" };
  };

  const stockStatus = getStockStatus();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "primary.main",
          color: "white",
          pb: 2,
        }}
      >
        <Inventory />
        {stockToEdit ? "Modifier le Stock" : "Ajouter un Nouveau Stock"}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Sélection de la pièce */}
          <Grid item xs={12}>
            <Autocomplete
              options={pieces}
              getOptionLabel={(option) => {
                const parts = [];
                if (option.name) parts.push(option.name);
                if (option.reference) parts.push(`Réf: ${option.reference}`);
                if (option.code) parts.push(`Code: ${option.code}`);
                return parts.join(" - ") || "Pièce inconnue";
              }}
              value={selectedPiece}
              onChange={handlePieceSelect}
              onInputChange={(_, value) => setSearchTerm(value)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sélectionner une pièce"
                  variant="outlined"
                  error={!!errors.piece_id}
                  helperText={errors.piece_id}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest}>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {option.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.reference && `Réf: ${option.reference}`}
                        {option.reference && option.code && " - "}
                        {option.code && `Code: ${option.code}`}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              disabled={!!stockToEdit}
              noOptionsText="Aucune pièce trouvée"
            />
          </Grid>

          {/* Informations de la pièce sélectionnée */}
          {selectedPiece && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <Info sx={{ mr: 1, verticalAlign: "middle" }} />
                  Informations de la pièce
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Nom:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPiece.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Référence:
                    </Typography>
                    <Typography variant="body1">
                      {selectedPiece.reference || "N/A"}
                    </Typography>
                  </Grid>
               {   /*<Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Code:
                    </Typography>
                    <Typography variant="body1">
                      {selectedPiece.code || "N/A"}
                    </Typography>
                  </Grid>*/}
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Contrôles de quantité */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="flex-end" gap={1}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleQuantityChange(-1)}
                disabled={formData.quantity <= 0}
                sx={{ minWidth: 40, height: 56 }}
              >
                <Remove />
              </Button>

              <TextField
                fullWidth
                label="Quantité Actuelle"
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setFormData((prev) => ({ ...prev, quantity: value }));
                }}
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                color="success"
                onClick={() => handleQuantityChange(1)}
                sx={{ minWidth: 40, height: 56 }}
              >
                <Add />
              </Button>
            </Box>
          </Grid>

          {/* Quantité minimum */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantité Minimum"
              type="number"
              value={formData.min_quantity}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setFormData((prev) => ({ ...prev, min_quantity: value }));
              }}
              error={!!errors.min_quantity}
              helperText={errors.min_quantity || "Seuil d'alerte pour le stock"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Warning color="warning" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Indicateur de statut du stock */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle2">Statut du stock:</Typography>
              <Chip
                label={stockStatus.label}
                color={stockStatus.color}
                size="medium"
                icon={
                  stockStatus.color === "error" ? (
                    <Warning />
                  ) : stockStatus.color === "warning" ? (
                    <Warning />
                  ) : (
                    <Inventory />
                  )
                }
              />
              {formData.quantity > 0 && formData.min_quantity > 0 && (
                <Typography variant="body2" color="text.secondary">
                  (
                  {Math.round(
                    (formData.quantity / formData.min_quantity) * 100
                  )}
                  % du seuil minimum)
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Affichage des changements lors de la modification */}
          {stockToEdit && formData.quantity !== initialQuantity && (
            <Grid item xs={12}>
              <Alert
                severity={
                  formData.quantity > initialQuantity ? "success" : "warning"
                }
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Changement détecté:</strong> {initialQuantity} →{" "}
                  {formData.quantity}(
                  {formData.quantity > initialQuantity ? "+" : ""}
                  {formData.quantity - initialQuantity})
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Raison de l'ajustement */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={
                stockToEdit ? "Raison de l'ajustement" : "Notes (optionnel)"
              }
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              error={!!errors.reason}
              helperText={
                errors.reason ||
                (stockToEdit && formData.quantity !== initialQuantity
                  ? "Requis pour les changements de quantité"
                  : "Optionnel")
              }
              multiline
              rows={3}
              variant="outlined"
              required={stockToEdit && formData.quantity !== initialQuantity}
              placeholder="Ex: Inventaire, Réception, Consommation, Correction d'erreur..."
            />
          </Grid>

          {/* Informations supplémentaires */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                {stockToEdit
                  ? "Vous modifiez le stock existant pour cette pièce."
                  : "Un nouvel enregistrement de stock sera créé pour cette pièce."}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          startIcon={<Close />}
          variant="outlined"
          disabled={loading}
          size="large"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          variant="contained"
          color="primary"
          disabled={loading || !formData.piece_id}
          size="large"
        >
          {loading
            ? "Traitement..."
            : stockToEdit
            ? "Mettre à jour"
            : "Créer le stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockForm;
