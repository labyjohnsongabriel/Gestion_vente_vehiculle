import React, { useState, useEffect } from "react";
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
  useMediaQuery,
  useTheme,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Close, Save, Edit, PersonAdd, CheckCircle } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { createClient, updateClient } from "../../Api2/clientAPI";




// Composants stylisés premium
const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    background: "linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)",
    maxWidth: "600px",
    width: "100%",
  },
}));

const PremiumButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "50px",
  padding: "12px 28px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  textTransform: "none",
  fontWeight: 500,
  letterSpacing: "0.5px",
  "&:hover": {
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    transform: "translateY(-2px)",
    background: "linear-gradient(135deg, #5a6fd1 0%, #6a4199 100%)",
  },
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  "&.Mui-disabled": {
    background: "#e0e0e0",
    color: "#a0a0a0",
  },
}));

const ClientForm = ({ open, onClose, refreshClients, clientToEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        email: clientToEdit.email || "",
        phone: clientToEdit.phone || "",
        address: clientToEdit.address || "",
        status: clientToEdit.status || "active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [clientToEdit, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    let filteredValue = value;
  
    if (name === "name") {
      // 1. Supprimer caractères non alphabétiques sauf espace
      filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
  
      // 2. Seulement si on a tapé un espace ou terminé un mot, on formate
      const endsWithSpace = filteredValue.endsWith(" ");
  
      if (!endsWithSpace) {
        // On formate seulement les mots quand on n'est pas en train de taper un espace
        filteredValue = filteredValue
          .split(" ")
          .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      }
    }
  
    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (clientToEdit) {
        await updateClient(clientToEdit.id, formData);
      } else {
        await createClient(formData);
      }

      setIsSuccess(true);
      refreshClients();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      Swal.fire({
        title: "Erreur",
        text: error.response?.data?.message || "Une erreur est survenue",
        icon: "error",
        background: "#fff",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumDialog
      open={open}
      onClose={isSubmitting ? null : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      TransitionComponent={Slide}
      transitionDuration={400}
    >
      <Fade in={open} timeout={600}>
        <Box>
          {/* En-tête premium */}
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {clientToEdit ? (
                <Edit sx={{ fontSize: 32 }} />
              ) : (
                <PersonAdd sx={{ fontSize: 32 }} />
              )}
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {clientToEdit ? "Modifier le Client" : "Nouveau Client"}
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
                },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          {/* Contenu du formulaire */}
          <DialogContent dividers sx={{ p: 4 }}>
            {isSuccess ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  textAlign: "center",
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: 80,
                    color: "#4caf50",
                    mb: 3,
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  {clientToEdit
                    ? "Client mis à jour avec succès!"
                    : "Client créé avec succès!"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Redirection en cours...
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#3a4b6d" }}
                  >
                    Veuillez remplir les informations du client
                  </Typography>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  
                  <TextField
                    label="Nom complet*"
                    name="name"
                    type="text"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

                  <TextField
                    label="Email*"
                    name="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

                  <TextField
                    label="Téléphone*"
                    name="phone"
                    type="number"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    variant="outlined"
                    inputProps={{ maxLength: 10 }} // ✅ Bloque à 10 chiffres
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

                  <TextField
                    label="Adresse"
                    name="address"
                    fullWidth
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={3}
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

             { /*    <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Statut
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label="Actif"
                        clickable
                        onClick={() =>
                          setFormData({ ...formData, status: "active" })
                        }
                        color={
                          formData.status === "active" ? "primary" : "default"
                        }
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 600,
                          padding: "8px 16px",
                        }}
                      />
                      <Chip
                        label="Inactif"
                        clickable
                        onClick={() =>
                          setFormData({ ...formData, status: "inactive" })
                        }
                        color={
                          formData.status === "inactive" ? "primary" : "default"
                        }
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 600,
                          padding: "8px 16px",
                        }}
                      />
                    </Box>
                  </Box>*/}
                </Box>
              </>
            )}
          </DialogContent>

          {/* Actions */}
          {!isSuccess && (
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={onClose}
                color="inherit"
                sx={{
                  borderRadius: "50px",
                  padding: "10px 24px",
                  textTransform: "none",
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <PremiumButton
                onClick={handleSave}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "En cours..."
                  : clientToEdit
                  ? "Mettre à jour"
                  : "Enregistrer"}
              </PremiumButton>
            </DialogActions>
          )}
        </Box>
      </Fade>
    </PremiumDialog>
  );
};

export default ClientForm;
