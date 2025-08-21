import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Tooltip,
  Fade,
  Slide,
} from "@mui/material";
import {
  PhotoCamera,
  Person,
  Email,
  Phone,
  LocationOn,
  Save,
  Cancel,
  Upload,
  Delete,
  Edit,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const PremiumButton = styled(Button)(({ theme }) => ({
  borderRadius: "50px",
  padding: "12px 28px",
  textTransform: "none",
  fontWeight: 500,
  letterSpacing: "0.5px",
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  },
}));

const SaveButton = styled(PremiumButton)(({ theme }) => ({
  background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
  },
}));

const CancelButton = styled(PremiumButton)(({ theme }) => ({
  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "15px",
  padding: "10px 20px",
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },
  transition: "all 0.3s ease",
}));

const ClientForm = ({ open, onClose, onSubmit, clientToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        email: clientToEdit.email || "",
        phone: clientToEdit.phone || "",
        address: clientToEdit.address || "",
        status: clientToEdit.status || "active",
        image: clientToEdit.image || null,
      });
      setImagePreview(clientToEdit.image || null);
    } else {
      // Reset form pour nouveau client
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        image: null,
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [clientToEdit, open]);

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    // Validation du téléphone
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    } else {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Format de téléphone invalide";
      }
    }

    // Validation de l'adresse
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "L'adresse doit contenir au moins 5 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Effacer l'erreur du champ si elle existe
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "Fichier trop volumineux",
        text: "La taille de l'image ne doit pas dépasser 5MB",
        icon: "warning",
        confirmButtonText: "Compris",
      });
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        title: "Format invalide",
        text: "Veuillez sélectionner un fichier image valide (JPG, PNG, GIF)",
        icon: "warning",
        confirmButtonText: "Compris",
      });
      return;
    }

    setUploadingImage(true);

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Erreur de validation",
        text: "Veuillez corriger les erreurs dans le formulaire",
        icon: "error",
        confirmButtonText: "Compris",
      });
      return;
    }

    setLoading(true);

    try {
      let createdClient = null;
      if (clientToEdit) {
        await onSubmit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          status: formData.status,
        });
      } else {
        // Création sans image
        createdClient = await onSubmit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          status: formData.status,
        });
        // Après création, upload image si présente
        if (formData.image && createdClient && createdClient.client && createdClient.client.id) {
          const formDataImage = new FormData();
          formDataImage.append("image", formData.image);
          const { uploadClientImage } = await import("../../Api2/clientAPI");
          await uploadClientImage(createdClient.client.id, formData.image);
        }
      }
      handleClose();
    } catch (error) {
      let msg = "Une erreur est survenue lors de l'enregistrement";
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      Swal.fire({
        title: "Erreur",
        text: msg,
        icon: "error",
        confirmButtonText: "Compris",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset après fermeture
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
          image: null,
        });
        setImagePreview(null);
        setErrors({});
      }, 300);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 3,
        }}
      >
        <Person sx={{ fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {clientToEdit ? "Modifier le Client" : "Nouveau Client"}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          {/* Section Photo */}
          <Card
            sx={{
              mb: 4,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Photo du Client
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={imagePreview}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "3px solid #667eea",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      fontSize: 48,
                      fontWeight: "bold",
                      background: imagePreview
                        ? "transparent"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {!imagePreview && formData.name ? (
                      formData.name.charAt(0).toUpperCase()
                    ) : !imagePreview ? (
                      <Person sx={{ fontSize: 48 }} />
                    ) : null}
                  </Avatar>

                  {uploadingImage && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                      }}
                    >
                      <CircularProgress size={40} sx={{ color: "white" }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    Ajoutez une photo pour personnaliser le profil du client
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <UploadButton
                      component="label"
                      startIcon={<Upload />}
                      disabled={uploadingImage}
                    >
                      {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </UploadButton>

                    {imagePreview && (
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={handleRemoveImage}
                        sx={{
                          borderColor: "#ff4444",
                          color: "#ff4444",
                          "&:hover": {
                            borderColor: "#ff3333",
                            backgroundColor: "rgba(255,68,68,0.04)",
                          },
                        }}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, color: "text.secondary" }}
                  >
                    Formats acceptés: JPG, PNG, GIF • Taille max: 5MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Informations du Client */}
          <Card
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Informations du Client
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom complet"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <Phone sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  >
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={formData.status}
                      label="Statut"
                      onChange={handleInputChange("status")}
                    >
                      <MenuItem value="active">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label="Actif"
                            color="success"
                            size="small"
                            sx={{ minWidth: 60 }}
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label="Inactif"
                            color="default"
                            size="small"
                            sx={{ minWidth: 60 }}
                          />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange("address")}
                    error={!!errors.address}
                    helperText={errors.address}
                    InputProps={{
                      startAdornment: (
                        <LocationOn
                          sx={{
                            color: "text.secondary",
                            mr: 1,
                            alignSelf: "flex-start",
                            mt: 1,
                          }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Message d'aide */}
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(102, 126, 234, 0.04)",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <Typography variant="body2">
                  💡 <strong>Conseil :</strong> Assurez-vous que toutes les
                  informations sont correctes avant de sauvegarder. Vous pourrez
                  les modifier ultérieurement.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid rgba(0,0,0,0.1)",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <CancelButton
            onClick={handleClose}
            startIcon={<Cancel />}
            disabled={loading}
          >
            Annuler
          </CancelButton>

          <SaveButton
            type="submit"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : clientToEdit
              ? "Mettre à jour"
              : "Créer le client"}
          </SaveButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientForm;
