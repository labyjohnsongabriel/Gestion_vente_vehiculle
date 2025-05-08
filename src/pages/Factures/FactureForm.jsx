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
  Autocomplete,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Save,
  Receipt,
  CheckCircle,
  Person,
  ShoppingCart,
  AttachMoney,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:5000/api/factures";
const COMMANDES_URL = "http://localhost:5000/api/commandes";
const CLIENTS_URL = "http://localhost:5000/api/clients";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
  },
}));

const FactureForm = ({ open, onClose, refreshFactures, factureToEdit }) => {
  const [formData, setFormData] = useState({
    commande_id: "",
    total: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem("authToken");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [commandesRes, clientsRes] = await Promise.all([
          axios.get(COMMANDES_URL, config),
          axios.get(CLIENTS_URL, config),
        ]);

        setCommandes(commandesRes.data);
        setClients(clientsRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        Swal.fire(
          "Erreur",
          error.response?.data?.message || "Impossible de charger les données",
          "error"
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (factureToEdit) {
      setFormData({
        commande_id: factureToEdit.commande_id,
        total: factureToEdit.total,
      });
    } else {
      setFormData({
        commande_id: "",
        total: "",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [factureToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCommandeChange = (e, newValue) => {
    const commandeId = newValue?.id || "";
    const selectedCommande = commandes.find(c => c.id === commandeId);
    
    setFormData(prev => ({
      ...prev,
      commande_id: commandeId,
      total: selectedCommande ? selectedCommande.total : "",
    }));
  };
const validateForm = () => {
  const newErrors = {};
  if (!formData.commande_id) {
    newErrors.commande_id = "Veuillez sélectionner une commande";
  }
  if (!formData.total || isNaN(formData.total)) {
    newErrors.total = "Montant invalide";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const payload = {
        commande_id: formData.commande_id,
        total: parseFloat(formData.total),
      };

      if (factureToEdit) {
        await axios.put(`${API_URL}/${factureToEdit.id}`, payload, config);
        Swal.fire("Succès", "Facture mise à jour avec succès", "success");
      } else {
        await axios.post(API_URL, payload, config);
        Swal.fire("Succès", "Facture créée avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshFactures();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Une erreur est survenue",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommandeOption = (props, option) => {
    const client = clients.find(c => c.id === option.client_id);
    return (
      <Box component="li" {...props} sx={{ py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#3f51b5" }}>
            <ShoppingCart />
          </Avatar>
          <Box>
            <Typography>Commande #{option.id}</Typography>
            <Typography variant="body2" color="text.secondary">
              Client: {client?.name || "Inconnu"} | Total: {option.total} €
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <PremiumDialog
      open={open}
      onClose={isSubmitting ? null : onClose}
      TransitionComponent={Slide}
      fullWidth
      maxWidth="md"
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
              <Receipt sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {factureToEdit ? "Modifier Facture" : "Nouvelle Facture"}
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
                <CheckCircle sx={{ fontSize: 80, color: "#4caf50", mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  {factureToEdit ? "Facture mise à jour!" : "Facture créée!"}
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
                    Informations de la facture
                  </Typography>
                  <Divider />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Sélection de la commande */}
                  <Autocomplete
                    options={commandes}
                    getOptionLabel={(option) => `Commande #${option.id} - ${option.total} €`}
                    value={commandes.find(c => c.id === formData.commande_id) || null}
                    onChange={handleCommandeChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Commande associée *"
                        error={!!errors.commande_id}
                        helperText={errors.commande_id}
                        placeholder="Rechercher une commande..."
                      />
                    )}
                    renderOption={renderCommandeOption}
                    loading={loadingData}
                    loadingText="Chargement des commandes..."
                    noOptionsText="Aucune commande trouvée"
                  />

                  {/* Montant de la facture */}
                  <TextField
                    label="Montant total *"
                    name="total"
                    value={formData.total}
                    onChange={(e) => handleChange("total", e.target.value)}
                    error={!!errors.total}
                    helperText={errors.total}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoney color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Date de création */}
                  <TextField
                    label="Date d'émission"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                  />
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
                sx={{ borderRadius: "50px", px: 3, textTransform: "none" }}
              >
                {isSubmitting
                  ? "En cours..."
                  : factureToEdit
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

export default FactureForm;