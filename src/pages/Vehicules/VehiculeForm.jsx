import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  InputAdornment,
  Alert,
  FormHelperText,
  Slide,
  Fade,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Close,
  Save,
  DirectionsCar,
  CalendarToday,
  Speed,
  LocalGasStation,
  ColorLens,
  Delete,
  Edit,
  CheckCircle,
  Warning,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000/api/vehicules";

// Styles personnalisés modernes
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    background: theme.palette.background.paper,
    backgroundImage: "none",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
  padding: theme.spacing(2, 3),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 0 0 2px rgba(107, 115, 255, 0.2)",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(107, 115, 255, 0.5)",
    },
  },
  marginBottom: theme.spacing(2),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: 12,
  background: theme.palette.background.default,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
}));

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor:
    status === "disponible"
      ? "#4CAF50"
      : status === "en maintenance"
      ? "#FF9800"
      : status === "indisponible"
      ? "#F44336"
      : "#2196F3",
  color: "white",
  fontWeight: 600,
  borderRadius: 8,
}));

const VehiculeForm = ({
  open,
  onClose,
  refreshVehicules,
  vehiculeToEdit,
  axiosInstance,
}) => {
  const initialFormState = {
    marque: "",
    modele: "",
    immatriculation: "",
    annee: new Date().getFullYear(),
    kilometrage: 0,
    type: "berline",
    statut: "disponible",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (vehiculeToEdit) {
        setFormData(vehiculeToEdit);
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [open, vehiculeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "annee" || name === "kilometrage") {
      const numValue = value === "" ? "" : Number(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.marque.trim()) newErrors.marque = "La marque est requise";
    if (!formData.modele.trim()) newErrors.modele = "Le modèle est requis";

    const immatRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    if (!immatRegex.test(formData.immatriculation)) {
      newErrors.immatriculation = "Format invalide. Ex: AB-123-CD";
    }

    if (!formData.annee) {
      newErrors.annee = "L'année est requise";
    } else if (
      formData.annee < 1900 ||
      formData.annee > new Date().getFullYear() + 1
    ) {
      newErrors.annee = "Année invalide";
    }

    if (formData.kilometrage < 0) {
      newErrors.kilometrage = "Le kilométrage ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (vehiculeToEdit) {
        await axiosInstance.put(`${API_URL}/${vehiculeToEdit.id}`, formData);
        Swal.fire({
          title: "Succès!",
          text: "Véhicule mis à jour avec succès",
          icon: "success",
          confirmButtonColor: "#6B73FF",
          showConfirmButton: false,
          timer: 1500,
          background: "#fff",
          backdrop: `
            rgba(107,115,255,0.4)
            left top
            no-repeat
          `,
        });
      } else {
        await axiosInstance.post(API_URL, formData);
        Swal.fire({
          title: "Succès!",
          text: "Véhicule ajouté avec succès",
          icon: "success",
          confirmButtonColor: "#6B73FF",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      refreshVehicules();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);

      if (error.response?.status === 400) {
        const serverErrors = error.response.data.errors;
        if (serverErrors) {
          setErrors(serverErrors);
        }
      } else if (error.response?.status === 401) {
        Swal.fire({
          title: "Session expirée",
          text: "Veuillez vous reconnecter",
          icon: "error",
          confirmButtonColor: "#6B73FF",
        });
      } else {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur s'est produite lors de l'enregistrement du véhicule",
          icon: "error",
          confirmButtonColor: "#6B73FF",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Confirmer la suppression",
      html: `
        <div style="text-align:center">
          <Warning color="error" style="font-size:60px;margin-bottom:20px"/>
          <p>Êtes-vous sûr de vouloir supprimer ce véhicule?</p>
          <p><strong>${formData.marque} ${formData.modele}</strong></p>
          <p>Cette action est irréversible.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4444",
      cancelButtonColor: "#6B73FF",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setDeleteLoading(true);
      try {
        await axiosInstance.delete(`${API_URL}/${vehiculeToEdit.id}`);
        Swal.fire({
          title: "Supprimé!",
          text: "Le véhicule a été supprimé avec succès",
          icon: "success",
          confirmButtonColor: "#6B73FF",
          showConfirmButton: false,
          timer: 1500,
        });
        refreshVehicules();
        onClose();
      } catch (error) {
        Swal.fire({
          title: "Erreur",
          text: "La suppression a échoué",
          icon: "error",
          confirmButtonColor: "#6B73FF",
        });
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={400}
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* En-tête personnalisé avec gradient moderne */}
      <FormHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 48,
              height: 48,
            }}
          >
            <DirectionsCar sx={{ fontSize: 28 }} />
          </Avatar>
          <Typography variant="h5" component="div" fontWeight={600}>
            {vehiculeToEdit ? "Modifier le véhicule" : "Nouveau véhicule"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{ color: "white" }}
          aria-label="fermer"
        >
          <Close />
        </IconButton>
      </FormHeader>

      <DialogContent sx={{ pt: 3, flexGrow: 1, overflowY: "auto" }}>
        {/* Informations principales */}
        <FormSection>
          <Typography
            variant="h6"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircle color="primary" /> Informations principales
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Marque"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.marque}
                helperText={errors.marque}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsCar color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Modèle"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.modele}
                helperText={errors.modele}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Immatriculation"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.immatriculation}
                helperText={errors.immatriculation || "Format: AB-123-CD"}
                disabled={loading}
                placeholder="AB-123-CD"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Année"
                name="annee"
                type="number"
                value={formData.annee}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.annee}
                helperText={errors.annee}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="date_ajout"
                name="date_ajout"
                type="date"
                value={formData.date_ajout}
                onChange={handleChange}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />

                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Kilométrage (km)"
                name="kilometrage"
                type="number"
                value={formData.kilometrage}
                onChange={handleChange}
                fullWidth
                error={!!errors.kilometrage}
                helperText={errors.kilometrage}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Speed color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type de véhicule</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="berline">Berline</MenuItem>
                  <MenuItem value="suv">SUV</MenuItem>
                  <MenuItem value="citadine">Citadine</MenuItem>
                  <MenuItem value="break">Break</MenuItem>
                  <MenuItem value="cabriolet">Cabriolet</MenuItem>
                  <MenuItem value="monospace">Monospace</MenuItem>
                  <MenuItem value="utilitaire">Utilitaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </FormSection>

        {/* Détails supplémentaires */}
        <FormSection>
          <Typography
            variant="h6"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Warning color="primary" /> Détails supplémentaires
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="disponible">
                    <StatusChip
                      label="Disponible"
                      status="disponible"
                      size="small"
                    />
                  </MenuItem>
                  <MenuItem value="en maintenance">
                    <StatusChip
                      label="En maintenance"
                      status="en maintenance"
                      size="small"
                    />
                  </MenuItem>
                  <MenuItem value="indisponible">
                    <StatusChip
                      label="Indisponible"
                      status="indisponible"
                      size="small"
                    />
                  </MenuItem>
                  <MenuItem value="réservé">
                    <StatusChip label="Réservé" status="réservé" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/*   <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Carburant</InputLabel>
                <Select
                  name="carburant"
                  value={formData.carburant || ""}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="essence">Essence</MenuItem>
                  <MenuItem value="diesel">Diesel</MenuItem>
                  <MenuItem value="hybride">Hybride</MenuItem>
                  <MenuItem value="electrique">Électrique</MenuItem>
                  <MenuItem value="gpl">GPL</MenuItem>
                </Select>
                <FormHelperText>
                  Type de carburant utilisé par le véhicule
                </FormHelperText>
              </FormControl>
            </Grid>
             */}
          </Grid>

          <StyledTextField
            label="Description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="Entrez des informations complémentaires sur le véhicule..."
          />
        </FormSection>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          justifyContent: "space-between",
          bgcolor: "#f7f9fc",
          borderTop: "1px solid #eee",
        }}
      >
        <Box>
          {vehiculeToEdit && (
            <Button
              onClick={handleDelete}
              color="error"
              variant="outlined"
              disabled={loading || deleteLoading}
              startIcon={
                deleteLoading ? (
                  <CircularProgress size={20} color="error" />
                ) : (
                  <Delete />
                )
              }
              sx={{ borderRadius: 2, mr: 2 }}
            >
              {deleteLoading ? "Suppression..." : "Supprimer"}
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading || deleteLoading}
            color="inherit"
            variant="outlined"
            startIcon={<Close />}
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading || deleteLoading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
                boxShadow: "0 4px 15px rgba(107, 115, 255, 0.4)",
              }}
            >
              {loading
                ? "Enregistrement..."
                : vehiculeToEdit
                ? "Mettre à jour"
                : "Enregistrer"}
            </Button>
          </motion.div>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default VehiculeForm;
