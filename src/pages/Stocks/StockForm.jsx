import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Fade,
  Slide,
  IconButton,
  Divider,
  CircularProgress,
  InputAdornment,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Close,
  Save,
  Inventory,
  CheckCircle,
  Numbers,
  Storage,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:5000/api/stocks";
const PIECES_URL = "http://localhost:5000/api/pieces";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
  },
}));

const StockForm = ({ open, onClose, refreshStocks, stockToEdit }) => {
  const [formData, setFormData] = useState({
    piece_id: "",
    quantity: 0,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchPieces = async () => {
      try {
        setLoadingData(true);
        const response = await axios.get(PIECES_URL);
        setPieces(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des pièces:", error);
        Swal.fire(
          "Erreur",
          error.response?.data?.message || "Impossible de charger les pièces",
          "error"
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchPieces();
    }
  }, [open]);

  useEffect(() => {
    if (stockToEdit) {
      setFormData({
        piece_id: stockToEdit.piece_id,
        quantity: stockToEdit.quantity,
      });
    } else {
      setFormData({
        piece_id: "",
        quantity: 0,
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [stockToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.piece_id) newErrors.piece_id = "Pièce requise";
    if (formData.quantity < 0) newErrors.quantity = "Quantité invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (stockToEdit) {
        await axios.put(`${API_URL}/${stockToEdit.id}`, formData);
        Swal.fire("Succès", "Stock mis à jour avec succès", "success");
      } else {
        await axios.post(API_URL, formData);
        Swal.fire("Succès", "Stock créé avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshStocks();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire(
        "Erreur",
        error.response?.data?.error || "Une erreur est survenue",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPieceName = (pieceId) => {
    const piece = pieces.find((p) => p.id === pieceId);
    return piece ? piece.name : "Pièce inconnue";
  };

  return (
    <PremiumDialog
      open={open}
      onClose={isSubmitting ? null : onClose}
      TransitionComponent={Slide}
      fullWidth
    >
      <Fade in={open}>
        <Box>
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 3,
              px: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Inventory sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {stockToEdit ? "Modifier Stock" : "Nouveau Stock"}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 4 }}>
            {isSuccess ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 6,
                }}
              >
                <CheckCircle sx={{ fontSize: 80, color: "#4c56bc", mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  {stockToEdit ? "Stock mis à jour!" : "Stock créé!"}
                </Typography>
              </Box>
            ) : loadingData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Informations du stock
                  </Typography>
                  <Divider />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Sélection de la pièce */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Pièce *
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#4c56bc" }}>
                        <Numbers />
                      </Avatar>
                      <TextField
                        select
                        label="Sélectionner une pièce"
                        name="piece_id"
                        value={formData.piece_id}
                        onChange={(e) =>
                          handleChange("piece_id", e.target.value)
                        }
                        error={!!errors.piece_id}
                        helperText={errors.piece_id}
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value=""></option>
                        {pieces.map((piece) => (
                          <option key={piece.id} value={piece.id}>
                            {piece.name} (ID: {piece.id})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                  </Box>

                  {/* Quantité */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Quantité *
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#4c56bc" }}>
                        <Storage />
                      </Avatar>
                      <TextField
                        label="Quantité en stock"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleChange("quantity", e.target.value)
                        }
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        fullWidth
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Statut du stock */}
                  {stockToEdit && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={formData.quantity > 0 ? "Disponible" : "Épuisé"}
                        color={formData.quantity > 0 ? "success" : "error"}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </Box>
              </>
            )}
          </DialogContent>

          {!isSuccess && !loadingData && (
            <DialogActions
              sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.12)" }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{ borderRadius: "50px", px: 3, textTransform: "none" }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                disabled={isSubmitting}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  textTransform: "none",
                }}
              >
                {isSubmitting
                  ? "En cours..."
                  : stockToEdit
                  ? "Mettre à jour"
                  : "Enregistrer"}
              </Button>
            </DialogActions>
          )}
        </Box>
      </Fade>
    </PremiumDialog>
  );
};

export default StockForm;
