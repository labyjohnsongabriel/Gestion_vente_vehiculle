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
  Grid,
  Alert,
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
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/pieces";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
}));

// Création d'une instance Axios configurée
const createApiClient = () => {
  const token = localStorage.getItem("token");
  const instance = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 8000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === "ECONNABORTED") {
        return Promise.reject(
          new Error("La requête a expiré - Vérifiez votre connexion")
        );
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

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
  const navigate = useNavigate();

  const logError = (error, context) => {
    const errorInfo = {
      date: new Date().toISOString(),
      error: error.message,
      context,
      route: window.location.pathname,
    };

    // Envoyer l'erreur au backend (optionnel)
    axios.post("/api/error-log", errorInfo).catch(console.error);

    if (process.env.NODE_ENV === "development") {
      console.groupCollapsed(`Erreur: ${context}`);
      console.error(errorInfo);
      console.groupEnd();
    }
  };

  const fetchPaginatedData = async (endpoint) => {
    try {
      const api = createApiClient();
      let allData = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page < 10) {
        // Limite de sécurité à 10 pages
        const res = await api.get(`${endpoint}?page=${page}&limit=100`);
        if (res.data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...res.data];
          page++;
        }
      }

      return allData;
    } catch (error) {
      throw error;
    }
  };

  const fetchInitialData = async () => {
    setLoadingData(true);
    setDataError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expirée - Veuillez vous reconnecter");
      }

      const api = createApiClient();

      const [categoriesRes, fournisseursRes] = await Promise.all([
        fetchPaginatedData("/categories").catch((e) => {
          throw new Error(`Catégories: ${e.message}`);
        }),
        fetchPaginatedData("/fournisseurs").catch((e) => {
          throw new Error(`Fournisseurs: ${e.message}`);
        }),
      ]);

      // Validation des données
      const verifyData = (data, name) => {
        if (!Array.isArray(data)) {
          throw new Error(`Format invalide pour ${name}`);
        }
        return data;
      };

      setCategories(verifyData(categoriesRes, "catégories"));
      setFournisseurs(verifyData(fournisseursRes, "fournisseurs"));

      if (categoriesRes.length === 0 || fournisseursRes.length === 0) {
        Swal.fire({
          title: "Données partielles",
          text: "Certaines données sont manquantes",
          icon: "warning",
          timer: 3000,
        });
      }
    } catch (error) {
      logError(error, "fetchInitialData");
      setDataError(error.message);

      if (error.message.includes("Session") || error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const fetchWithRetry = async () => {
    try {
      await fetchInitialData();
    } catch (error) {
      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        setTimeout(fetchWithRetry, 2000 * retryCount);
      } else {
        setDataError("Échec après 3 tentatives. Vérifiez votre connexion.");
      }
    }
  };

  useEffect(() => {
    if (open) {
      setRetryCount(0);
      fetchWithRetry();
    }
  }, [open]);

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
  }, [pieceToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nom requis";
    if (!formData.reference.trim()) newErrors.reference = "Référence requise";
    if (formData.price <= 0) newErrors.price = "Prix doit être positif";
    if (formData.stock_quantity < 0)
      newErrors.stock_quantity = "Stock invalide";
    if (!formData.category_id) newErrors.category_id = "Catégorie requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const api = createApiClient();
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      if (pieceToEdit) {
        await api.put(`/pieces/${pieceToEdit.id}`, payload);
        Swal.fire("Succès", "Pièce mise à jour avec succès", "success");
      } else {
        await api.post("/pieces", payload);
        Swal.fire("Succès", "Pièce créée avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshPieces();
        onClose();
      }, 1500);
    } catch (error) {
      logError(error, "handleSubmit");
      let errorMessage = "Une erreur est survenue";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expirée - Veuillez vous reconnecter";
          localStorage.removeItem("token");
          navigate("/login");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Données invalides";
        }
      }

      Swal.fire("Erreur", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Erreur", "L'image ne doit pas dépasser 5MB", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const api = createApiClient();
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.imageUrl) {
        throw new Error("URL d'image manquante dans la réponse");
      }

      handleChange("image", response.data.imageUrl);
    } catch (error) {
      logError(error, "handleImageUpload");
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Échec de l'upload de l'image",
        "error"
      );
    }
  };

  const handleRetry = () => {
    setDataError(null);
    setRetryCount(0);
    fetchWithRetry();
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
                        handleChange("price", parseFloat(e.target.value))
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
                        handleChange("stock_quantity", parseInt(e.target.value))
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
                      value={
                        categories.find(
                          (cat) => cat.id === formData.category_id
                        ) || null
                      }
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
                      fullWidth
                      noOptionsText="Aucune catégorie disponible"
                      loading={loadingData}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={fournisseurs}
                      getOptionLabel={(option) => option.name || "Inconnu"}
                      value={
                        fournisseurs.find(
                          (four) => four.id === formData.fournisseur_id
                        ) || null
                      }
                      onChange={(e, newValue) =>
                        handleChange("fournisseur_id", newValue?.id || "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Fournisseur"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <LocalShipping />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      fullWidth
                      noOptionsText="Aucun fournisseur disponible"
                      loading={loadingData}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={formData.image || "/default-part.png"}
                        sx={{ width: 80, height: 80 }}
                        variant="rounded"
                      />
                      <Button
                        variant="contained"
                        component="label"
                        disabled={isSubmitting}
                      >
                        Uploader Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
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
