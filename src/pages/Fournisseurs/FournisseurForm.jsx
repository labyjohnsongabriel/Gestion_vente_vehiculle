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
  Avatar,
} from "@mui/material";
import { Close, Save, Edit, Business, CheckCircle, CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:5000/api/fournisseurs";

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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FournisseurForm = ({ open, onClose, refreshFournisseurs, fournisseurToEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    status: "active",
   // image: null,
   // imagePreview: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (fournisseurToEdit) {
      setFormData({
        nom: fournisseurToEdit.nom || "",
        email: fournisseurToEdit.email || "",
        telephone: fournisseurToEdit.telephone || "",
        adresse: fournisseurToEdit.adresse || "",
        status: fournisseurToEdit.status || "active",
        image: fournisseurToEdit.image || null,
        imagePreview: fournisseurToEdit.image || "",
      });
    } else {
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        status: "active",
        image: null,
        imagePreview: "",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [fournisseurToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('status', formData.status);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (fournisseurToEdit) {
        await axios.put(`${API_URL}/${fournisseurToEdit.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(API_URL, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setIsSuccess(true);
      refreshFournisseurs();

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
              {fournisseurToEdit ? (
                <Edit sx={{ fontSize: 32 }} />
              ) : (
                <Business sx={{ fontSize: 32 }} />
              )}
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {fournisseurToEdit ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
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
                  {fournisseurToEdit
                    ? "Fournisseur mis à jour avec succès!"
                    : "Fournisseur créé avec succès!"}
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
                    Veuillez remplir les informations du fournisseur
                  </Typography>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Section image */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={formData.imagePreview}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        border: "3px solid #667eea",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    >
                      {formData.nom?.charAt(0)}
                    </Avatar>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{
                        borderRadius: "50px",
                        background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #5a62e0 0%, #0008cc 100%)",
                        },
                      }}
                    >
                      Choisir une image
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                      />
                    </Button>
                  </Box>

                  <TextField
                    label="Nom du fournisseur*"
                    name="nom"
                    fullWidth
                    value={formData.nom}
                    onChange={handleChange}
                    error={!!errors.nom}
                    helperText={errors.nom}
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
                    name="telephone"
                    fullWidth
                    value={formData.telephone}
                    onChange={handleChange}
                    error={!!errors.telephone}
                    helperText={errors.telephone}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

                  <TextField
                    label="Adresse"
                    name="adresse"
                    fullWidth
                    value={formData.adresse}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={3}
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                    />
                    {/**
                     * 
                  <Box>
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
                  </Box>

                     */}
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
                  : fournisseurToEdit
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

export default FournisseurForm;