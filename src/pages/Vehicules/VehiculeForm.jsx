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
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Save,
  DirectionsCar,
  CheckCircle,
  CalendarToday,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/vehicules";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
    background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  "& .MuiDialogContent-root::-webkit-scrollbar": {
    display: "none",
  },
  "& .MuiDialogContent-root": {
    scrollbarWidth: "none" /* Firefox */,
    msOverflowStyle: "none" /* IE and Edge */,
  },
}));

const VehiculeForm = ({ open, onClose, refreshVehicules, vehiculeToEdit }) => {
  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    immatriculation: "",
    type: "",
    statut: "disponible",
    dateMiseEnService: new Date().toISOString().split("T")[0],
    kilometrage: "",
    annee: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const typeOptions = ["Voiture", "Camion", "Moto", "Utilitaire", "Autre"];
  const statutOptions = ["disponible", "en maintenance", "hors service"];

  useEffect(() => {
    if (vehiculeToEdit) {
      setFormData({
        marque: vehiculeToEdit.marque || "",
        modele: vehiculeToEdit.modele || "",
        immatriculation: vehiculeToEdit.immatriculation || "",
        type: vehiculeToEdit.type || "",
        statut: vehiculeToEdit.statut || "disponible",
        dateMiseEnService:
          vehiculeToEdit.dateMiseEnService ||
          new Date().toISOString().split("T")[0],
        kilometrage: vehiculeToEdit.kilometrage || "",
        annee: vehiculeToEdit.annee || "",
      });
    } else {
      setFormData({
        marque: "",
        modele: "",
        immatriculation: "",
        type: "",
        statut: "disponible",
        dateMiseEnService: new Date().toISOString().split("T")[0],
        kilometrage: "",
        annee: "",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [vehiculeToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.marque) newErrors.marque = "Marque requise";
    if (!formData.modele) newErrors.modele = "Modèle requis";
    if (!formData.immatriculation)
      newErrors.immatriculation = "Immatriculation requise";
    if (!formData.type) newErrors.type = "Type de véhicule requis";
    if (!formData.kilometrage) newErrors.kilometrage = "Kilométrage requis";
    if (!formData.annee) newErrors.annee = "Année requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        Swal.fire(
          "Erreur d'authentification",
          "Votre session a expiré. Veuillez vous reconnecter.",
          "error"
        );
        navigate("/login");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (vehiculeToEdit) {
        await axios.put(`${API_URL}/${vehiculeToEdit.id}`, formData, config);
        Swal.fire("Succès", "Véhicule mis à jour avec succès", "success");
      } else {
        await axios.post(API_URL, formData, config);
        Swal.fire("Succès", "Véhicule créé avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshVehicules();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Token")
      ) {
        localStorage.removeItem("authToken"); // Supprimer le token invalide
        navigate("/login");
        Swal.fire("Session expirée", "Veuillez vous reconnecter", "info");
      } else {
        Swal.fire(
          "Erreur",
          error.response?.data?.message || "Une erreur est survenue",
          "error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
              borderRadius: "16px 16px 0 0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DirectionsCar sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {vehiculeToEdit ? "Modifier Véhicule" : "Nouveau Véhicule"}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "rotate(90deg)",
                  transition: "transform 0.3s ease",
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 4, overflow: "hidden" }}>
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
                  {vehiculeToEdit ? "Véhicule mis à jour!" : "Véhicule créé!"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Redirection en cours...
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Informations du véhicule
                  </Typography>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    maxHeight: "60vh",
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  <TextField
                    label="Marque *"
                    value={formData.marque}
                    onChange={(e) => handleChange("marque", e.target.value)}
                    error={!!errors.marque}
                    helperText={errors.marque}
                    fullWidth
                  />

                  <TextField
                    label="Modèle *"
                    value={formData.modele}
                    onChange={(e) => handleChange("modele", e.target.value)}
                    error={!!errors.modele}
                    helperText={errors.modele}
                    fullWidth
                  />

                  <TextField
                    label="Immatriculation *"
                    value={formData.immatriculation}
                    onChange={(e) =>
                      handleChange("immatriculation", e.target.value)
                    }
                    error={!!errors.immatriculation}
                    helperText={errors.immatriculation}
                    fullWidth
                  />

                  <Autocomplete
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e, newValue) => handleChange("type", newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type de véhicule *"
                        error={!!errors.type}
                        helperText={errors.type}
                      />
                    )}
                  />

                  <Autocomplete
                    options={statutOptions}
                    value={formData.statut}
                    onChange={(e, newValue) => handleChange("statut", newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Statut du véhicule" />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Chip
                          label={
                            option === "disponible"
                              ? "Disponible"
                              : option === "en maintenance"
                              ? "En maintenance"
                              : "Hors service"
                          }
                          color={
                            option === "disponible"
                              ? "success"
                              : option === "en maintenance"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {option}
                      </Box>
                    )}
                  />
                  <TextField
                    label="Kilométrage *"
                    type="number"
                    value={formData.kilometrage}
                    onChange={(e) =>
                      handleChange("kilometrage", e.target.value)
                    }
                    error={!!errors.kilometrage}
                    helperText={errors.kilometrage}
                    fullWidth
                  />
                  <TextField
                    label="Année *"
                    type="number"
                    value={formData.annee}
                    onChange={(e) => handleChange("annee", e.target.value)}
                    error={!!errors.annee}
                    helperText={errors.annee}
                    fullWidth
                  />

                  <TextField
                    label="Date de mise en service"
                    type="date"
                    value={formData.dateMiseEnService}
                    onChange={(e) =>
                      handleChange("dateMiseEnService", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="action" />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </>
            )}
          </DialogContent>

          {!isSuccess && (
            <DialogActions
              sx={{
                p: 3,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(245,245,245,0.5)",
              }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                }}
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
                  },
                }}
              >
                {isSubmitting
                  ? "En cours..."
                  : vehiculeToEdit
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

export default VehiculeForm;
