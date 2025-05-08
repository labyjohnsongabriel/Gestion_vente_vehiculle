import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  TextField,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import {
  Close,
  ShoppingCart,
  Person,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  Print,
  Add,
  Edit,
  Delete,
  Save,
  Cancel
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const PremiumDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "100%",
    background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
}));

const CommandeDetails = ({ open, onClose, refreshCommandes }) => {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editDetailId, setEditDetailId] = useState(null);
  const [newDetail, setNewDetail] = useState({
    piece_id: "",
    quantity: 1,
    price: 0
  });
  const [pieces, setPieces] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open && id) {
      fetchCommandeDetails();
      fetchPieces();
    }
  }, [open, id]);

  const fetchCommandeDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [commandeRes, detailsRes] = await Promise.all([
        axios.get(`/api/commandes/${id}`),
        axios.get(`/api/commandes/${id}/details`)
      ]);

      setCommande(commandeRes.data);
      setDetails(detailsRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      setError("Erreur lors du chargement des détails");
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPieces = async () => {
    try {
      const response = await axios.get("/api/pieces");
      setPieces(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des pièces:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddDetail = async () => {
    try {
      setError("");
      const response = await axios.post(`/api/commandes/${id}/details`, newDetail);
      setDetails([...details, response.data]);
      setNewDetail({ piece_id: "", quantity: 1, price: 0 });
      refreshCommandes();
    } catch (error) {
      console.error("Erreur lors de l'ajout du détail:", error);
      setError(error.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleUpdateDetail = async (detailId, updatedData) => {
    try {
      setError("");
      await axios.put(`/api/details/${detailId}`, updatedData);
      setDetails(details.map(d => d.id === detailId ? { ...d, ...updatedData } : d));
      setEditDetailId(null);
      refreshCommandes();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDeleteDetail = async (detailId) => {
    try {
      setError("");
      await axios.delete(`/api/details/${detailId}`);
      setDetails(details.filter(d => d.id !== detailId));
      refreshCommandes();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleNewDetailChange = (e) => {
    const { name, value } = e.target;
    setNewDetail(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  return (
    <PremiumDialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
            Détails de la commande #{id}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Imprimer">
            <IconButton onClick={handlePrint} sx={{ color: "white", mr: 1 }}>
              <Print />
            </IconButton>
          </Tooltip>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Informations générales
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Person color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Client
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {commande.client_name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Person color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Responsable
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {commande.user_name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <CalendarToday color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date de commande
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(commande.date_commande).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <AttachMoney color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Montant total
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {commande.montant.toFixed(2)} €
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <LocalShipping color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Statut
                      </Typography>
                      <Chip
                        label={commande.statut}
                        color={
                          commande.statut === "Livrée"
                            ? "success"
                            : commande.statut === "Annulée"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Articles commandés
                </Typography>
                <Button 
                  startIcon={<Add />} 
                  variant="contained"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Annuler" : "Ajouter un article"}
                </Button>
              </Box>

              {editMode && (
                <Paper sx={{ p: 2, mb: 3, background: "#f5f5f5" }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Ajouter un nouvel article
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Pièce</InputLabel>
                        <Select
                          name="piece_id"
                          value={newDetail.piece_id}
                          onChange={handleNewDetailChange}
                          label="Pièce"
                        >
                          {pieces.map(piece => (
                            <MenuItem key={piece.id} value={piece.id}>
                              {piece.name} ({piece.reference}) - {piece.price} €
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        name="quantity"
                        label="Quantité"
                        type="number"
                        value={newDetail.quantity}
                        onChange={handleNewDetailChange}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        name="price"
                        label="Prix unitaire"
                        type="number"
                        value={newDetail.price}
                        onChange={handleNewDetailChange}
                        inputProps={{ step: "0.01", min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleAddDetail}
                        sx={{ height: "100%" }}
                        disabled={!newDetail.piece_id || !newDetail.quantity || !newDetail.price}
                      >
                        Ajouter
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "background.default" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Article</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Quantité</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Prix unitaire</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
                              {detail.piece_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={500}>
                                {detail.piece_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Ref: {detail.reference}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {editDetailId === detail.id ? (
                            <TextField
                              name="quantity"
                              type="number"
                              value={detail.quantity}
                              onChange={(e) => {
                                const updatedDetails = details.map(d => 
                                  d.id === detail.id 
                                    ? { ...d, quantity: Number(e.target.value) } 
                                    : d
                                );
                                setDetails(updatedDetails);
                              }}
                              inputProps={{ min: 1 }}
                              size="small"
                              sx={{ width: 80 }}
                            />
                          ) : (
                            detail.quantity
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editDetailId === detail.id ? (
                            <TextField
                              name="price"
                              type="number"
                              value={detail.price}
                              onChange={(e) => {
                                const updatedDetails = details.map(d => 
                                  d.id === detail.id 
                                    ? { ...d, price: Number(e.target.value) } 
                                    : d
                                );
                                setDetails(updatedDetails);
                              }}
                              inputProps={{ step: "0.01", min: 0 }}
                              size="small"
                              sx={{ width: 100 }}
                            />
                          ) : (
                            `${detail.price.toFixed(2)} €`
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {(detail.price * detail.quantity).toFixed(2)} €
                        </TableCell>
                        <TableCell align="center">
                          {editDetailId === detail.id ? (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Enregistrer">
                                <IconButton
                                  onClick={() => handleUpdateDetail(detail.id, {
                                    quantity: detail.quantity,
                                    price: detail.price
                                  })}
                                  color="primary"
                                >
                                  <Save fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Annuler">
                                <IconButton
                                  onClick={() => setEditDetailId(null)}
                                  color="secondary"
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => setEditDetailId(detail.id)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDeleteDetail(detail.id)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "background.default" }}>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                        Total général
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {details.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} €
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: "50px",
            px: 3,
            textTransform: "none",
          }}
        >
          Fermer
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{
            borderRadius: "50px",
            px: 3,
            textTransform: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          Imprimer
        </Button>
      </DialogActions>
    </PremiumDialog>
  );
};

export default CommandeDetails;