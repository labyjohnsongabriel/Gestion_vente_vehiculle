import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Autocomplete,
  Card,
  Divider,
  Typography,
  Alert,
  CircularProgress,
  Box,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ShoppingCart,
  Close,
  Calculate as CalculateIcon,
  Warning,
  CheckCircle,
  Inventory,
  Person,
  Receipt,
  Save,
  Clear,
  ExpandMore,
  LocalShipping,
  Payment,
  Description,
  Summarize,
} from "@mui/icons-material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/ventes";
const PIECES_API_URL = "http://localhost:5000/api/pieces";
const CLIENTS_API_URL = "http://localhost:5000/api/clients";
const STOCK_API_URL = "http://localhost:5000/api/stock";

// Composant pour les onglets personnalisés
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vente-tabpanel-${index}`}
      aria-labelledby={`vente-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VenteForm = ({ open, onClose, venteToEdit, refreshVentes }) => {
  // États du formulaire
  const [form, setForm] = useState({
    piece: null,
    client: null,
    quantite: "",
    prix_unitaire: "",
    reduction: 0,
    notes: "",
    status: "completed",
    mode_paiement: "especes",
  });

  // États de données
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pieces, setPieces] = useState([]);
  const [clients, setClients] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [stockVerification, setStockVerification] = useState(null);

  // États de validation
  const [validationErrors, setValidationErrors] = useState({});
  const [isStockChecking, setIsStockChecking] = useState(false);

  // États pour l'organisation de l'interface
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      setLoadingData(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [piecesResponse, clientsResponse] = await Promise.all([
          axios.get(PIECES_API_URL, { headers }),
          axios.get(CLIENTS_API_URL, { headers }),
        ]);

        // Traitement des pièces avec vérification du stock
        let piecesData = piecesResponse.data;
        if (piecesData?.data && Array.isArray(piecesData.data)) {
          piecesData = piecesData.data;
        } else if (!Array.isArray(piecesData)) {
          piecesData = Object.values(piecesData || {});
        }

        // Filtrer les pièces avec stock disponible et ajouter des alertes
        const availablePieces = [];
        const alerts = [];

        piecesData.forEach((piece) => {
          if (piece.stock_quantity > 0) {
            availablePieces.push({
              ...piece,
              displayLabel: `${piece.name} - Stock: ${piece.stock_quantity} - ${piece.price}€`,
              stockStatus: piece.stock_quantity <= 5 ? "low" : "available",
            });

            if (piece.stock_quantity <= 5) {
              alerts.push({
                type: "warning",
                message: `Stock faible pour ${piece.name}: ${piece.stock_quantity} restant(s)`,
              });
            }
          } else {
            alerts.push({
              type: "error",
              message: `${piece.name} en rupture de stock`,
            });
          }
        });

        setPieces(availablePieces);
        setStockAlerts(alerts);

        // Traitement des clients
        let clientsData = clientsResponse.data;
        if (clientsData?.data && Array.isArray(clientsData.data)) {
          clientsData = clientsData.data;
        } else if (!Array.isArray(clientsData)) {
          clientsData = Object.values(clientsData || {});
        }

        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [open]);

  // Vérification du stock en temps réel
  const checkStockAvailability = async (pieceId, quantity) => {
    if (!pieceId || !quantity || quantity <= 0) {
      setStockVerification(null);
      return true;
    }

    setIsStockChecking(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${STOCK_API_URL}/check/${pieceId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { requested_quantity: quantity },
      });

      const verification = {
        available: response.data.available,
        current_stock: response.data.current_stock,
        requested: quantity,
        message: response.data.message,
      };

      setStockVerification(verification);
      return verification.available;
    } catch (error) {
      console.error("Erreur vérification stock:", error);
      // Fallback: vérifier avec les données locales
      const piece = pieces.find((p) => p.id === pieceId);
      const isAvailable = piece ? piece.stock_quantity >= quantity : false;

      setStockVerification({
        available: isAvailable,
        current_stock: piece?.stock_quantity || 0,
        requested: quantity,
        message: isAvailable ? "Stock suffisant" : "Stock insuffisant",
      });

      return isAvailable;
    } finally {
      setIsStockChecking(false);
    }
  };

  // Effet pour vérifier le stock lors des changements
  useEffect(() => {
    if (form.piece && form.quantite) {
      const quantity = parseInt(form.quantite);
      if (quantity > 0) {
        checkStockAvailability(form.piece.id, quantity);
      }
    }
  }, [form.piece, form.quantite]);

  // Calculer les valeurs dérivées
  const calculatedValues = useMemo(() => {
    const quantite = parseFloat(form.quantite) || 0;
    const prixUnitaire = parseFloat(form.prix_unitaire) || 0;
    const reduction = parseFloat(form.reduction) || 0;

    const sousTotal = quantite * prixUnitaire;
    const montantReduction = Math.min(reduction, sousTotal); // La réduction ne peut pas dépasser le sous-total
    const total = Math.max(0, sousTotal - montantReduction);
    const tva = total * 0.2; // TVA à 20%
    const totalTTC = total + tva;

    return {
      sousTotal,
      montantReduction,
      total,
      tva,
      totalTTC,
      isValid: quantite > 0 && prixUnitaire > 0,
    };
  }, [form.quantite, form.prix_unitaire, form.reduction]);

  // Initialiser le formulaire pour édition
  useEffect(() => {
    if (open && venteToEdit && pieces.length > 0 && clients.length > 0) {
      const piece = pieces.find((p) => p.id === venteToEdit.piece_id);
      const client = clients.find((c) => c.id === venteToEdit.client_id);

      setForm({
        piece: piece || null,
        client: client || null,
        quantite: venteToEdit.quantite?.toString() || "",
        prix_unitaire: venteToEdit.prix_unitaire?.toString() || "",
        reduction: venteToEdit.reduction?.toString() || "0",
        notes: venteToEdit.notes || "",
        status: venteToEdit.status || "completed",
        mode_paiement: venteToEdit.mode_paiement || "especes",
      });
    } else if (open && !venteToEdit) {
      // Réinitialiser pour nouvelle vente
      setForm({
        piece: null,
        client: null,
        quantite: "",
        prix_unitaire: "",
        reduction: 0,
        notes: "",
        status: "completed",
        mode_paiement: "especes",
      });
      setStockVerification(null);
      setValidationErrors({});
      setActiveStep(0);
      setTabValue(0);
    }
  }, [venteToEdit, open, pieces, clients]);

  // Gestion des changements de formulaire
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Supprimer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Mettre à jour le prix unitaire automatiquement
    if (field === "piece" && value) {
      setForm((prev) => ({
        ...prev,
        prix_unitaire: value.price?.toString() || "",
      }));
    }
  };

  // Validation complète du formulaire
  const validateForm = async () => {
    const errors = {};

    // Validations de base
    if (!form.piece) {
      errors.piece = "Veuillez sélectionner une pièce";
    }

    if (!form.client) {
      errors.client = "Veuillez sélectionner un client";
    }

    const quantite = parseInt(form.quantite);
    if (!form.quantite || quantite <= 0) {
      errors.quantite = "Veuillez saisir une quantité valide (> 0)";
    }

    const prixUnitaire = parseFloat(form.prix_unitaire);
    if (!form.prix_unitaire || prixUnitaire <= 0) {
      errors.prix_unitaire = "Veuillez saisir un prix unitaire valide (> 0)";
    }

    const reduction = parseFloat(form.reduction || 0);
    if (reduction < 0) {
      errors.reduction = "La réduction ne peut pas être négative";
    }

    // Validation du stock
    if (form.piece && quantite > 0) {
      const stockAvailable = await checkStockAvailability(
        form.piece.id,
        quantite
      );
      if (!stockAvailable) {
        errors.stock = `Stock insuffisant. Disponible: ${
          stockVerification?.current_stock || 0
        }`;
      }
    }

    // Validation de la réduction
    if (reduction > 0 && quantite > 0 && prixUnitaire > 0) {
      const sousTotal = quantite * prixUnitaire;
      if (reduction > sousTotal) {
        errors.reduction = "La réduction ne peut pas dépasser le sous-total";
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        piece_id: form.piece.id,
        client_id: form.client.id,
        quantite: parseInt(form.quantite),
        prix_unitaire: parseFloat(form.prix_unitaire),
        reduction: parseFloat(form.reduction || 0),
        prix_total: calculatedValues.total,
        tva: calculatedValues.tva,
        prix_ttc: calculatedValues.totalTTC,
        notes: form.notes?.trim() || "",
        status: form.status,
        mode_paiement: form.mode_paiement,
        date_vente: new Date().toISOString().split("T")[0],
      };

      let response;
      if (venteToEdit?.id) {
        // Modification
        response = await axios.put(`${API_URL}/${venteToEdit.id}`, payload, {
          headers,
        });
        setSuccess("Vente modifiée avec succès !");
      } else {
        // Création nouvelle vente
        response = await axios.post(API_URL, payload, { headers });
        setSuccess("Vente enregistrée avec succès !");

        // Enregistrer le mouvement de stock
        await axios.post(
          `${STOCK_API_URL}/movement`,
          {
            piece_id: form.piece.id,
            type: "sortie",
            quantity: parseInt(form.quantite),
            reason: `Vente #${response.data.id || "N/A"}`,
            reference_id: response.data.id,
            reference_type: "vente",
          },
          { headers }
        );
      }

      // Fermer après succès
      setTimeout(() => {
        refreshVentes();
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Une erreur s'est produite lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      piece: null,
      client: null,
      quantite: "",
      prix_unitaire: "",
      reduction: 0,
      notes: "",
      status: "completed",
      mode_paiement: "especes",
    });
    setValidationErrors({});
    setStockVerification(null);
    setError("");
    setSuccess("");
    setActiveStep(0);
    setTabValue(0);
  };

  // Formatage des labels
  const getPieceLabel = (piece) => {
    if (!piece) return "";
    const stockIcon = piece.stockStatus === "low" ? "⚠️" : "✅";
    return `${stockIcon} ${piece.name} (Stock: ${piece.stock_quantity}) - ${piece.price}€`;
  };

  const getClientLabel = (client) => {
    if (!client) return "";
    return client.nom && client.prenom
      ? `${client.nom} ${client.prenom}`
      : client.nom || client.name || `Client #${client.id}`;
  };

  // Navigation par étapes
  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "white",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ShoppingCart />
          <Typography variant="h6" component="div">
            {venteToEdit ? "Modifier la vente" : "Nouvelle vente"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Stepper pour la progression */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Sélection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Détails</StepLabel>
          </Step>
          <Step>
            <StepLabel>Validation</StepLabel>
          </Step>
        </Stepper>

        {/* Messages d'erreur/succès */}
        {(error || success) && (
          <Alert
            severity={error ? "error" : "success"}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => (error ? setError("") : setSuccess(""))}
          >
            {error || success}
          </Alert>
        )}

        {loadingData ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress size={50} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Chargement des données...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Étape 1: Sélection */}
            {activeStep === 0 && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  sx={{ mb: 3 }}
                >
                  <Inventory sx={{ mr: 1, verticalAlign: "middle" }} />
                  Sélection des articles et du client
                </Typography>

                {/* Alertes de stock */}
                {stockAlerts.length > 0 && (
                  <Accordion sx={{ mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Warning color="warning" sx={{ mr: 1 }} />
                        <Typography>
                          Alertes Stock ({stockAlerts.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {stockAlerts.map((alert, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={alert.message}
                              sx={{
                                color:
                                  alert.type === "error"
                                    ? "error.main"
                                    : "warning.main",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Grid container spacing={3}>
                  {/* Sélection Pièce */}
                  <Grid item xs={12} md={1}>
                    <Card sx={{ p: 6, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        color="primary"
                      >
                        <Inventory
                          sx={{ mr: 28, verticalAlign: "middle", fontSize: 20 }}
                        />
                        Pièce à vendre
                      </Typography>
                      <Autocomplete
                        options={pieces}
                        getOptionLabel={getPieceLabel}
                        value={form.piece}
                        onChange={(event, newValue) =>
                          handleChange("piece", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Rechercher une pièce *"
                            fullWidth
                            required
                            error={!!validationErrors.piece}
                            helperText={
                              validationErrors.piece ||
                              "Sélectionnez la pièce à vendre"
                            }
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Avatar
                                src={option.image}
                                sx={{
                                  mr: 2,
                                  bgcolor:
                                    option.stockStatus === "low"
                                      ? "warning.main"
                                      : "success.main",
                                }}
                              >
                                {option.name?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" fontWeight="bold">
                                  {option.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Prix: {option.price}€ | Stock:{" "}
                                  {option.stock_quantity}
                                </Typography>
                                {option.stockStatus === "low" && (
                                  <Chip
                                    label="Stock faible"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </li>
                        )}
                        disabled={loading}
                        loading={loadingData}
                        noOptionsText="Aucune pièce disponible en stock"
                      />
                    </Card>
                  </Grid>

                  {/* Sélection Client */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 6, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        color="primary"
                      >
                        <Person
                          sx={{ mr: 38, verticalAlign: "middle", fontSize: 20 }}
                        />
                        Client
                      </Typography>
                      <Autocomplete
                        options={clients}
                        getOptionLabel={getClientLabel}
                        value={form.client}
                        onChange={(event, newValue) =>
                          handleChange("client", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Rechercher un client *"
                            fullWidth
                            required
                            error={!!validationErrors.client}
                            helperText={
                              validationErrors.client ||
                              "Sélectionnez le client"
                            }
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="body1">
                                  {getClientLabel(option)}
                                </Typography>
                                {option.email && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {option.email}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </li>
                        )}
                        disabled={loading}
                        loading={loadingData}
                        noOptionsText="Aucun client disponible"
                      />
                    </Card>
                  </Grid>

                  {form.piece && (
                    <Grid item xs={12}>
                      <Card sx={{ p: 2, bgcolor: "info.light" }}>
                        <Box display="flex" alignItems="center">
                          <Inventory sx={{ mr: 1, color: "info.dark" }} />
                          <Typography variant="subtitle2" color="info.dark">
                            Information sur la pièce sélectionnée
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {form.piece.description ||
                            "Aucune description disponible."}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={!form.piece || !form.client}
                  >
                    Suivant: Détails de la vente
                  </Button>
                </Box>
              </Box>
            )}

            {/* Étape 2: Détails de la transaction */}
            {activeStep === 1 && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  sx={{ mb: 6 }}
                >
                  <CalculateIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Détails de la transaction
                </Typography>

                <Grid container spacing={12}>
                  {/* Quantité */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Quantité *"
                      type="number"
                      fullWidth
                      required
                      value={form.quantite}
                      onChange={(e) => handleChange("quantite", e.target.value)}
                      inputProps={{
                        min: 1,
                        max: form.piece?.stock_quantity || 999,
                      }}
                      error={!!validationErrors.quantite}
                      helperText={
                        validationErrors.quantite ||
                        (form.piece
                          ? `Stock disponible: ${form.piece.stock_quantity}`
                          : "Nombre de pièces")
                      }
                      disabled={loading || isStockChecking}
                      InputProps={{
                        endAdornment: isStockChecking && (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Vérification du stock */}
                    {stockVerification && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={
                            stockVerification.available ? (
                              <CheckCircle />
                            ) : (
                              <Warning />
                            )
                          }
                          label={stockVerification.message}
                          color={
                            stockVerification.available ? "success" : "error"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Grid>

                  {/* Prix unitaire */}
                  <Grid item xs={12} md={12}>
                    <TextField
                      label="Prix unitaire (€) *"
                      type="number"
                      fullWidth
                      required
                      value={form.prix_unitaire}
                      onChange={(e) =>
                        handleChange("prix_unitaire", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">€</InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0.1, step: 0.01 }}
                      error={!!validationErrors.prix_unitaire}
                      helperText={
                        validationErrors.prix_unitaire || "Prix par pièce"
                      }
                      disabled={loading}
                    />
                  </Grid>
        
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Réduction (€)"
                      type="number"
                      fullWidth
                      value={form.reduction}
                      onChange={(e) =>
                        handleChange("reduction", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">€</InputAdornment>
                        ),
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                        max: calculatedValues.sousTotal,
                      }}
                      error={!!validationErrors.reduction}
                      helperText={
                        validationErrors.reduction ||
                        `Maximum: ${calculatedValues.sousTotal.toFixed(2)}€`
                      }
                      disabled={loading}
                    />
                  </Grid>

                  {/* Mode de paiement */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Mode de paiement</InputLabel>
                      <Select
                        value={form.mode_paiement}
                        label="Mode de paiement"
                        onChange={(e) =>
                          handleChange("mode_paiement", e.target.value)
                        }
                        disabled={loading}
                      >
                        <MenuItem value="especes">Espèces</MenuItem>
                        <MenuItem value="carte">Carte bancaire</MenuItem>
                        <MenuItem value="cheque">Chèque</MenuItem>
                        <MenuItem value="virement">Virement</MenuItem>
                        <MenuItem value="credit">À crédit</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Statut */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Statut de la vente</InputLabel>
                      <Select
                        value={form.status}
                        label="Statut de la vente"
                        onChange={(e) => handleChange("status", e.target.value)}
                        disabled={loading}
                      >
                        <MenuItem value="completed">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CheckCircle
                              sx={{ mr: 1, color: "success.main" }}
                            />
                            Terminé
                          </Box>
                        </MenuItem>
                        <MenuItem value="pending">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Warning sx={{ mr: 1, color: "warning.main" }} />
                            En attente
                          </Box>
                        </MenuItem>
                        <MenuItem value="cancelled">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Close sx={{ mr: 1, color: "error.main" }} />
                            Annulé
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Notes */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Notes"
                      multiline
                      rows={3}
                      fullWidth
                      value={form.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      helperText="Informations complémentaires (max 500 caractères)"
                      disabled={loading}
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>

                  {/* Erreur de stock */}
                  {validationErrors.stock && (
                    <Grid item xs={12}>
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        <Typography variant="body1">
                          {validationErrors.stock}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Stock actuel: {stockVerification?.current_stock || 0}{" "}
                          | Quantité demandée:{" "}
                          {stockVerification?.requested || 0}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button variant="outlined" onClick={handlePrevStep}>
                    Retour
                  </Button>
                  <Button variant="contained" onClick={handleNextStep}>
                    Suivant: Récapitulatif
                  </Button>
                </Box>
              </Box>
            )}

            {/* Étape 3: Récapitulatif */}
            {activeStep === 2 && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  sx={{ mb: 3 }}
                >
                  <Summarize sx={{ mr: 1, verticalAlign: "middle" }} />
                  Récapitulatif de la vente
                </Typography>

                <Grid container spacing={3}>
                  {/* Informations sur la pièce et le client */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        color="primary"
                      >
                        Détails de la pièce
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={form.piece?.image}>
                              {form.piece?.name?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={form.piece?.name}
                            secondary={`Référence: ${
                              form.piece?.reference || "N/A"
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Quantité"
                            secondary={form.quantite}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Prix unitaire"
                            secondary={`${form.prix_unitaire} €`}
                          />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        color="primary"
                      >
                        Informations client
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={getClientLabel(form.client)}
                            secondary={form.client?.email || "Aucun email"}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Mode de paiement"
                            secondary={form.mode_paiement}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Statut"
                            secondary={form.status}
                          />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>

                  {/* Résumé de la transaction */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        backgroundColor: "#f8f9fa",
                        p: 3,
                        borderRadius: 3,
                        border: "2px solid",
                        borderColor: calculatedValues.isValid
                          ? "success.main"
                          : "grey.300",
                      }}
                    >
                      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                        <Receipt color="primary" sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" color="primary">
                          Résumé de la facture
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            Sous-total HT:
                          </Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body1">
                            {calculatedValues.sousTotal.toFixed(2)} €
                          </Typography>
                        </Grid>

                        {calculatedValues.montantReduction > 0 && (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="body1" color="secondary">
                                Réduction:
                              </Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                              <Typography variant="body1" color="secondary">
                                -{calculatedValues.montantReduction.toFixed(2)}{" "}
                                €
                              </Typography>
                            </Grid>
                          </>
                        )}

                        <Grid item xs={6}>
                          <Typography variant="body1">Total HT:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body1">
                            {calculatedValues.total.toFixed(2)} €
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            TVA (20%):
                          </Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" color="text.secondary">
                            {calculatedValues.tva.toFixed(2)} €
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary"
                          >
                            Total TTC:
                          </Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary"
                          >
                            {calculatedValues.totalTTC.toFixed(2)} €
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  {/* Notes */}
                  {form.notes && (
                    <Grid item xs={12}>
                      <Card sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          color="primary"
                        >
                          Notes
                        </Typography>
                        <Typography variant="body2">{form.notes}</Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button variant="outlined" onClick={handlePrevStep}>
                    Retour
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={
                      loading ||
                      loadingData ||
                      !calculatedValues.isValid ||
                      (stockVerification && !stockVerification.available)
                    }
                    sx={{ minWidth: 200, borderRadius: 2 }}
                  >
                    {loading
                      ? "Traitement..."
                      : venteToEdit
                      ? "Modifier la vente"
                      : "Enregistrer la vente"}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{ p: 3, bgcolor: "grey.50", justifyContent: "space-between" }}
      >
        <Box>
          <Button
            onClick={resetForm}
            disabled={loading || loadingData}
            startIcon={<Clear />}
            variant="outlined"
            color="secondary"
          >
            Effacer
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading || loadingData}
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            Annuler
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VenteForm;
