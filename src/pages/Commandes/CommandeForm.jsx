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
} from "@mui/material";
import {
  Close,
  Save,
  ShoppingCart,
  CheckCircle,
  Person,
  Business,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "http://localhost:5000/api/commandes";
const CLIENTS_URL = "http://localhost:5000/api/clients";
const USERS_URL = "http://localhost:5000/api/users";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
  },
}));

const CommandeForm = ({ open, onClose, refreshCommandes, commandeToEdit }) => {
  const [formData, setFormData] = useState({
    client_id: "",
    user_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchClientsAndUsers = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem("authToken");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [clientsRes, usersRes] = await Promise.all([
          axios.get(CLIENTS_URL, config),
          axios.get(USERS_URL, config),
        ]);

        setClients(clientsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        Swal.fire(
          "Erreur",
          error.response?.data?.message || "Impossible de charger les données",
          "error"
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchClientsAndUsers();
    }
  }, [open]);

  useEffect(() => {
    if (commandeToEdit) {
      setFormData({
        client_id: commandeToEdit.client_id,
        user_id: commandeToEdit.user_id,
      });
    } else {
      setFormData({
        client_id: "",
        user_id: "",
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
    if (!formData.client_id)
      newErrors.client_id = "Veuillez sélectionner un client";
    if (!formData.user_id)
      newErrors.user_id = "Veuillez sélectionner un utilisateur";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const payload = {
        client_id: formData.client_id,
        user_id: formData.user_id,
      };

      if (commandeToEdit) {
        await axios.put(`${API_URL}/${commandeToEdit.id}`, payload, config);
        Swal.fire("Succès", "Commande mise à jour avec succès", "success");
      } else {
        await axios.post(API_URL, payload, config);
        Swal.fire("Succès", "Commande créée avec succès", "success");
      }

      setIsSuccess(true);
      setTimeout(() => {
        refreshCommandes();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Une erreur est survenue",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClientOption = (props, option) => (
    <Box component="li" {...props} sx={{ py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#3f51b5" }}>{option.name.charAt(0)}</Avatar>
        <Box>
          <Typography>{option.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {option.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const renderUserOption = (props, option) => (
    <Box component="li" {...props} sx={{ py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#4caf50" }}>
          {option.firstName.charAt(0)}
        </Avatar>
        <Box>
          <Typography>
            {option.firstName} {option.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {option.role}
          </Typography>
        </Box>
      </Box>
    </Box>
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
              sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
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
                  {/* Sélection du client */}
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => option.name}
                    value={
                      clients.find((c) => c.id === formData.client_id) || null
                    }
                    onChange={(e, newValue) =>
                      handleChange("client_id", newValue?.id || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client *"
                        error={!!errors.client_id}
                        helperText={errors.client_id}
                        placeholder="Rechercher un client..."
                      />
                    )}
                    renderOption={renderClientOption}
                    loading={loadingData}
                    loadingText="Chargement des clients..."
                    noOptionsText="Aucun client trouvé"
                  />

                  {/* Sélection de l'utilisateur */}
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    value={users.find((u) => u.id === formData.user_id) || null}
                    onChange={(e, newValue) =>
                      handleChange("user_id", newValue?.id || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Utilisateur *"
                        error={!!errors.user_id}
                        helperText={errors.user_id}
                        placeholder="Rechercher un utilisateur..."
                        rows={3}
                        InputProps={{
                          sx: { borderRadius: "12px" },
                        }}
                      />
                    )}
                    renderOption={renderUserOption}
                    loading={loadingData}
                    loadingText="Chargement des utilisateurs..."
                    noOptionsText="Aucun utilisateur trouvé"
                  />

                  {/* Champ de date */}
                  <TextField
                    label="Date *"
                    type="date"
                    fullWidth
                    value={formData.created_at || ""}
                    onChange={(e) => handleChange("date", e.target.value)}
                    rows={3}
                    InputProps={{
                      sx: { borderRadius: "12px" },
                    }}
                    error={!!errors.created_at}
                    helperText={errors.created_at}
                  />
                </Box>
              </>
            )}
          </DialogContent>

          {!isSuccess && !loadingData && (
            <DialogActions
              sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.12)" }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{ borderRadius: "50px", px: 3, textTransform: "none" }}
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
                sx={{ borderRadius: "50px", px: 3, textTransform: "none" }}
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
