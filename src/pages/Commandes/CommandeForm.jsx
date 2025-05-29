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
  ShoppingCart,
  CheckCircle,
  Person,
  CalendarToday,
  AttachMoney,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/commandes";
const CLIENTS_URL = "http://localhost:5000/api/clients";
const USERS_URL = "http://localhost:5000/api/users";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
    background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
}));

const CommandeForm = ({ open, onClose, refreshCommandes, commandeToEdit }) => {
  const [formData, setFormData] = useState({
    client_id: "",
    user_id: "",
    date_commande: new Date().toISOString().split("T")[0],
    montant: "",
    status: "En préparation",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (token && token.split(".").length === 3) {
      return token;
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    Swal.fire("Session expirée", "Veuillez vous reconnecter", "info");
  };

  const axiosWithAuth = (token) => {
    return axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchClients = async (token) => {
    try {
      const instance = axiosWithAuth(token);
      const response = await instance.get(CLIENTS_URL);

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      return [];
    }
  };

  const fetchUsers = async (token) => {
    try {
      const instance = axiosWithAuth(token);
      const response = await instance.get(USERS_URL);
      console.log("Réponse complète users:", response);

      // Solution 1: Vérification approfondie de la réponse
      if (!response.data) {
        throw new Error("Réponse vide de l'API users");
      }

      // Solution 2: Gestion des différents formats de réponse
      const usersData = response.data.data || response.data;

      if (!Array.isArray(usersData)) {
        throw new Error("Format de données utilisateurs invalide");
      }

      return usersData;
    } catch (error) {
      console.error(
        "Erreur fetchUsers:",
        error.response?.data || error.message
      );
      throw error; // Important pour le Promise.all
    }
  };

  const fetchClientsAndUsers = async () => {
    setLoadingData(true);

    try {
      const token = getAuthToken();
      if (!token) {
        handleLogout();
        return;
      }

      // Solution 3: Chargement séparé avec gestion d'erreur indépendante
      let clientsData = [];
      let usersData = [];

      try {
        clientsData = await fetchClients(token);
      } catch (e) {
        console.error("Erreur clients seulement:", e);
        Swal.fire("Erreur", "Chargement clients échoué", "warning");
      }

      try {
        usersData = await fetchUsers(token);
      } catch (e) {
        console.error("Erreur users seulement:", e);
        Swal.fire("Erreur", "Chargement utilisateurs échoué", "warning");
      }

      setClients(clientsData);
      setUsers(usersData);

      // Solution 4: Logs de contrôle
      console.log("Clients chargés:", clientsData.length);
      console.log("Users chargés:", usersData.length);
    } catch (error) {
      console.error("Erreur globale:", error);
      Swal.fire("Erreur", "Problème de chargement des données", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClientsAndUsers();
    }
  }, [open]);

  useEffect(() => {
    if (commandeToEdit) {
      setFormData({
        client_id: commandeToEdit.client_id || "",
        user_id: commandeToEdit.user_id || "",
        date_commande:
          commandeToEdit.date_commande ||
          new Date().toISOString().split("T")[0],
        montant: commandeToEdit.montant || "",
        status: commandeToEdit.status || "En préparation",
      });
    } else {
      setFormData({
        
        client_id: "",
        user_id: "",
        date_commande: new Date().toISOString().split("T")[0],
        montant: "",
        status: "En préparation",
      });
    }
    setErrors({});
    setIsSuccess(false);
  }, [commandeToEdit, open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client_id) newErrors.client_id = "Client requis";
    if (!formData.user_id) newErrors.user_id = "Utilisateur requis";
    if (!formData.montant || isNaN(formData.montant))
      newErrors.montant = "Montant invalide";
    if (!formData.date_commande) newErrors.date_commande = "Date requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        handleLogout();
        return;
      }

      const instance = axiosWithAuth(token);
      const payload = {
        client_id: formData.client_id,
        user_id: formData.user_id,
        date_commande: formData.date_commande,
        montant: parseFloat(formData.montant),
        status: formData.status,
      };

      if (commandeToEdit) {
        await instance.put(`${API_URL}/${commandeToEdit.id}`, payload);
        Swal.fire("Succès", "Commande mise à jour", "success");
      } else {
        await instance.post(API_URL, payload);
        Swal.fire("Succès", "Commande créée", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshCommandes();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        Swal.fire(
          "Erreur",
          error.response?.data?.message || "Erreur inconnue",
          "error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientById = (id) =>
    clients.find((client) => client.id == id) || null;
  const getUserById = (id) => users.find((user) => user.id == id) || null;

  const renderClientOption = (props, option) => (
    <Box component="li" {...props} sx={{ py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#3f51b5" }}>
          {option.name?.charAt(0) || "C"}
        </Avatar>
        <Box>
          <Typography>{option.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {option.email} | {option.phone || "N/A"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const renderUserOption = (props, option) => (
    <Box component="li" {...props} sx={{ py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#4caf50" }}>
          {option.firstName?.charAt(0) || "U"}
        </Avatar>
        <Box>
          <Typography>
            {option.firstName} {option.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {option.role} | {option.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const statutOptions = [
    "En préparation",
    "Validée",
    "En cours de livraison",
    "Livrée",
    "Annulée",
  ];

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
              <ShoppingCart sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {commandeToEdit ? "Modifier Commande" : "Nouvelle Commande"}
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
                  {commandeToEdit ? "Commande mise à jour!" : "Commande créée!"}
                </Typography>
              </Box>
            ) : loadingData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={60} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Chargement des données...
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Informations de la commande
                  </Typography>
                  <Divider />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Autocomplete
                    id="client-select"
                    options={clients}
                    getOptionLabel={(option) => option.name || ""}
                    value={getClientById(formData.client_id)}
                    onChange={(e, newValue) =>
                      handleChange("client_id", newValue?.id || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client *"
                        error={!!errors.client_id}
                        helperText={errors.client_id}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    renderOption={renderClientOption}
                    loading={loadingData}
                  />

                  <Autocomplete
                    id="user-select"
                    options={users}
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`.trim()
                    }
                    value={getUserById(formData.user_id)}
                    onChange={(e, newValue) =>
                      handleChange("user_id", newValue?.id || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Responsable *"
                        error={!!errors.user_id}
                        helperText={errors.user_id}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    renderOption={renderUserOption}
                    loading={loadingData}
                  />

                  <TextField
                    label="Date de commande *"
                    type="date"
                    value={formData.date_commande}
                    onChange={(e) =>
                      handleChange("date_commande", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="action" />
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.date_commande}
                    helperText={errors.date_commande}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Montant total *"
                    type="number"
                    inputMode="decimal"
                    value={formData.montant}
                    onChange={(e) =>
                      handleChange("montant", parseFloat(e.target.value))
                    }
                    error={!!errors.montant}
                    helperText={errors.montant}
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

                  <Autocomplete
                    id="statut-select"
                    options={statutOptions}
                    value={formData.status}
                    onChange={(e, newValue) => handleChange("status", newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Statut de la commande" />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Chip
                          label={option}
                          color={
                            option === "Livrée"
                              ? "success"
                              : option === "Annulée"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {option}
                      </Box>
                    )}
                  />
                </Box>
              </>
            )}
          </DialogContent>

          {!isSuccess && !loadingData && (
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {isSubmitting
                  ? "En cours..."
                  : commandeToEdit
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

export default CommandeForm;
