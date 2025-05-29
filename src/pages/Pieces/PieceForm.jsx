import React, { useEffect, useState } from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
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
  Grid,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  Save,
  Construction,
  CheckCircle,
  AttachMoney,
  Inventory,
  Category,
  LocalShipping,
  Refresh,
  CloudUpload,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:5000/api/pieces";
const CATEGORIES_URL = "http://localhost:5000/api/categories";
const FOURNISSEURS_URL = "http://localhost:5000/api/fournisseurs";
const UPLOAD_URL = "http://localhost:5000/api/upload";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
}));

const PieceForm = ({ open, onClose, refreshPieces, pieceToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    reference: "",
    stock_quantity: 0,
    category_id: "",
    fournisseur_id: "",
  });

  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fonction améliorée pour charger les données initiales
  const fetchInitialData = async () => {
    setLoadingData(true);
    setDataError(null);

    try {
      const [categoriesRes, fournisseursRes] = await Promise.all([
        axios.get(CATEGORIES_URL),
        axios.get(FOURNISSEURS_URL),
      ]);

      // Vérification et extraction robustes
      const categoriesData = categoriesRes.data;
      const fournisseursData = fournisseursRes.data;

      const normalizedCategories = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(categoriesData.categories)
        ? categoriesData.categories
        : [];

      const normalizedFournisseurs = Array.isArray(fournisseursData)
        ? fournisseursData
        : Array.isArray(fournisseursData.fournisseurs)
        ? fournisseursData.fournisseurs
        : [];

      // Enregistrement des données
      setCategories(normalizedCategories);
      setFournisseurs(normalizedFournisseurs);

      // Vérification utile
      if (normalizedFournisseurs.length === 0) {
        console.warn(
          "⚠ Aucun fournisseur récupéré. Vérifiez le format ou le contenu de l'API :",
          fournisseursRes.data
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      setDataError(`Erreur de chargement: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  // Fonction de réessai améliorée
  const fetchWithRetry = async () => {
    try {
      await fetchInitialData();
    } catch (error) {
      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        setTimeout(fetchWithRetry, 2000 * retryCount);
      } else {
        setDataError(
          "Échec après 3 tentatives. Vérifiez votre connexion et les endpoints API."
        );
      }
    }
  };

  useEffect(() => {
    if (open) {
      setRetryCount(0);
      fetchWithRetry();
    }
  }, [open]);

  // Initialisation du formulaire
  useEffect(() => {
    if (pieceToEdit) {
      setFormData({
        name: pieceToEdit.name || "",
        description: pieceToEdit.description || "",
        price: pieceToEdit.price || 0,
        image: pieceToEdit.image || "",
        reference: pieceToEdit.reference || "",
        stock_quantity: pieceToEdit.stock_quantity || 0,
        category_id: pieceToEdit.category_id || "",
        fournisseur_id: pieceToEdit.fournisseur_id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        image: "",
        reference: "",
        stock_quantity: 0,
        category_id: "",
        fournisseur_id: "",
      });
    }
    setErrors({});
    setIsSuccess(false);
    setUploadProgress(0);
  }, [pieceToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation améliorée du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nom requis";
    if (formData.name.length > 100)
      newErrors.name = "Nom trop long (max 100 caractères)";

    if (!formData.reference.trim()) newErrors.reference = "Référence requise";
    if (formData.reference.length > 50)
      newErrors.reference = "Référence trop longue (max 50 caractères)";

    if (formData.price <= 0) newErrors.price = "Prix doit être positif";
    if (formData.price > 1000000) newErrors.price = "Prix trop élevé";

    if (formData.stock_quantity < 0)
      newErrors.stock_quantity = "Stock invalide";
    if (formData.stock_quantity > 100000)
      newErrors.stock_quantity = "Stock trop élevé";

    if (!formData.category_id) newErrors.category_id = "Catégorie requise";

    // Validation optionnelle du fournisseur
    if (
      formData.fournisseur_id &&
      !fournisseurs.some((f) => f.id === formData.fournisseur_id)
    ) {
      newErrors.fournisseur_id = "Fournisseur invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        // Assurez-vous que les IDs sont des nombres si nécessaire
        category_id: Number(formData.category_id),
        fournisseur_id: formData.fournisseur_id
          ? Number(formData.fournisseur_id)
          : null,
      };

      if (pieceToEdit) {
        await axios.put(`${API_URL}/${pieceToEdit.id}`, payload);
        Swal.fire("Succès", "Pièce mise à jour avec succès", "success");
      } else {
        await axios.post(API_URL, payload);
        Swal.fire("Succès", "Pièce créée avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshPieces();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      let errorMessage = "Une erreur est survenue";

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = "Une pièce avec cette référence existe déjà";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      Swal.fire("Erreur", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload d'image avec progression
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifications du fichier
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Erreur", "L'image ne doit pas dépasser 5MB", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      Swal.fire(
        "Erreur",
        "Type de fichier non supporté (JPEG, PNG, WebP seulement)",
        "error"
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Correction ici : construire une URL absolue si besoin
      let imageUrl = response.data && response.data.url;
      if (imageUrl && imageUrl.startsWith("/uploads")) {
        imageUrl = `http://localhost:5000${imageUrl}`;
      }
      if (!imageUrl) {
        throw new Error("URL d'image manquante dans la réponse");
      }

      handleChange("image", imageUrl);
      Swal.fire("Succès", "Image uploadée avec succès", "success");
    } catch (error) {
      console.error("Erreur upload image:", error);
      Swal.fire(
        "Erreur",
        `Échec de l'upload de l'image: ${error.message}`,
        "error"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRetry = () => {
    setDataError(null);
    setRetryCount(0);
    fetchWithRetry();
  };

  // Trouver les objets complets pour les valeurs sélectionnées
  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category_id
  );
  const selectedFournisseur = fournisseurs.find(
    (four) => four.id === formData.fournisseur_id
  );

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
              background: "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 3,
              borderRadius: "16px 16px 0 0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Construction sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {pieceToEdit ? "Modifier Pièce" : "Nouvelle Pièce"}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
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
                  {pieceToEdit ? "Pièce mise à jour!" : "Pièce créée!"}
                </Typography>
              </Box>
            ) : loadingData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={60} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Chargement des données...
                </Typography>
              </Box>
            ) : dataError ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Alert
                  severity="error"
                  sx={{ mb: 3, width: "100%" }}
                  action={
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={handleRetry}
                    >
                      <Refresh />
                    </IconButton>
                  }
                >
                  {dataError}
                </Alert>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" onClick={onClose}>
                    Fermer
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={handleRetry}
                  >
                    Réessayer ({3 - retryCount} tentatives restantes)
                  </Button>
                </Box>

                {retryCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Tentative {retryCount + 1}/3
                  </Typography>
                )}
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Informations de la pièce
                  </Typography>
                  <Divider />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nom *"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Référence *"
                      value={formData.reference}
                      onChange={(e) =>
                        handleChange("reference", e.target.value)
                      }
                      error={!!errors.reference}
                      helperText={errors.reference}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Prix *"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleChange("price", parseFloat(e.target.value) || 0)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                        inputProps: { min: 0, step: "0.01" },
                      }}
                      error={!!errors.price}
                      helperText={errors.price}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Stock *"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        handleChange(
                          "stock_quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory />
                          </InputAdornment>
                        ),
                        inputProps: { min: 0 },
                      }}
                      error={!!errors.stock_quantity}
                      helperText={errors.stock_quantity}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={categories}
                      getOptionLabel={(option) => option.name || "Inconnu"}
                      value={selectedCategory || null}
                      onChange={(e, newValue) =>
                        handleChange("category_id", newValue?.id || "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Catégorie *"
                          error={!!errors.category_id}
                          helperText={errors.category_id}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <Category />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      fullWidth
                      noOptionsText="Aucune catégorie disponible"
                      loading={loadingData}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={fournisseurs}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : option?.nom || option?.name || "Inconnu"
                      }
                      value={selectedFournisseur || null}
                      onChange={(e, newValue) => {
                        handleChange("fournisseur_id", newValue?.id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Fournisseur"
                          error={!!errors.fournisseur_id}
                          helperText={errors.fournisseur_id}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <LocalShippingIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.nom || option.name}
                          {option.contact && (
                            <Chip
                              label={option.contact}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </li>
                      )}
                      fullWidth
                      noOptionsText={
                        fournisseurs.length === 0
                          ? "Aucun fournisseur disponible"
                          : "Aucun résultat"
                      }
                      loading={loadingData}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={
                          formData.image
                            ? formData.image.startsWith("http")
                              ? formData.image
                              : formData.image.startsWith("/uploads")
                              ? `http://localhost:5000${formData.image}`
                              : "/default-part.png"
                            : "/default-part.png"
                        }
                        sx={{ width: 80, height: 80 }}
                        variant="rounded"
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Button
                          variant="contained"
                          component="label"
                          disabled={isSubmitting || isUploading}
                          startIcon={<CloudUpload />}
                          fullWidth
                        >
                          Uploader Image
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                          />
                        </Button>
                        {isUploading && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={uploadProgress}
                            />
                            <Typography variant="caption">
                              {uploadProgress}% complété
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>

          {!isSuccess && !loadingData && !dataError && (
            <DialogActions
              sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{ borderRadius: "50px", px: 3 }}
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
                  background:
                    "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
                }}
              >
                {isSubmitting
                  ? "En cours..."
                  : pieceToEdit
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

export default PieceForm;
