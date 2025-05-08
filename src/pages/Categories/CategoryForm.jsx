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
  Chip,
  Avatar,
} from "@mui/material";
import { Close, Save, Category, CheckCircle, Error } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "../../api/axios"; // Assurez-vous que le chemin est correct

const API_URL = "http://localhost:5000/api/categories";

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

const CategoryForm = ({ open, onClose, refreshCategories, categoryToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description,
        status: categoryToEdit.status,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [categoryToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (categoryToEdit) {
        // Mise à jour de la catégorie existante
        await axios.put(`${API_URL}/${categoryToEdit.id}`, formData);
      } else {
        // Création d'une nouvelle catégorie
        await axios.post(API_URL, formData);
      }

      setIsSuccess(true);
      refreshCategories();

      // Fermer après 1.5s si succès
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      Swal.fire({
        title: "Erreur",
        text: error.response?.data?.error || "Une erreur est survenue",
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
              <Category sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {categoryToEdit
                  ? "Modifier la Catégorie"
                  : "Nouvelle Catégorie"}
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
                  {categoryToEdit
                    ? "Catégorie mise à jour avec succès!"
                    : "Catégorie créée avec succès!"}
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
                    Veuillez remplir les détails de la catégorie
                  </Typography>
                  <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Nom de la catégorie*"
                    name="name"
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
                    label="Description"
                    name="description"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                  />

              {/*    <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Statut*
                      </Typography>
                      {
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label="Active"
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
                        label="Inactive"
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
                onClick={handleSubmit}
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
                  : categoryToEdit
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

export default CategoryForm;
