import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Box,
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Fade,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Divider,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Refresh,
  ShoppingCart,
  Receipt,
  AttachMoney,
  Person,
  LocalShipping,
  FilterList,
  Close,
  Print,
  FileDownload,
  Visibility,
  Warning,
  CheckCircle,
  TrendingUp,
  Assessment,
  DateRange,
  Euro,
  ShoppingBag,
  PersonAdd,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import VentesForm from "./VenteForm"; // Ajout import

const API_URL = "http://localhost:5000/api/ventes";
const PIECES_API_URL = "http://localhost:5000/api/pieces";
const CLIENTS_API_URL = "http://localhost:5000/api/clients";
const AUTH_API_URL = "http://localhost:5000/api/auth/me";

const PremiumTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    background:
      "linear-gradient(90deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)",
  },
  "&:hover": {
    background:
      "linear-gradient(90deg, rgba(225,245,255,1) 0%, rgba(255,255,255,1) 100%)",
    transform: "scale(1.005)",
    boxShadow: theme.shadows[1],
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const Ventes = () => {
  // États principaux
  const [ventes, setVentes] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [clients, setClients] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [venteToEdit, setVenteToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedVente, setSelectedVente] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // États pour les filtres
  const [filterClient, setFilterClient] = useState("");
  const [filterPiece, setFilterPiece] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fonction pour afficher les notifications
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Charger dynamiquement les ventes, pièces et clients depuis l'API
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ventesRes, piecesRes, clientsRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(PIECES_API_URL),
          axios.get(CLIENTS_API_URL),
        ]);
        setVentes(ventesRes.data);
        setPieces(piecesRes.data);
        setClients(clientsRes.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur de chargement des données");
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [ventesRes, piecesRes, clientsRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(PIECES_API_URL),
        axios.get(CLIENTS_API_URL),
      ]);
      setVentes(ventesRes.data);
      setPieces(piecesRes.data);
      setClients(clientsRes.data);
      showSnackbar("Données actualisées avec succès");
    } catch (err) {
      showSnackbar("Erreur lors de l'actualisation", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = (vente) => {
    if (userRole !== "admin") {
      showSnackbar(
        "Vous n'avez pas la permission de modifier les ventes",
        "error"
      );
      return;
    };

    // Gestion des changements de formulaire de vente
    const handleVenteFormChange = (field, value) => {
      setVenteForm({
        ...venteForm,
        [field]: value,
      });
    };

    // Soumission du formulaire de vente
    const handleSubmitVente = async () => {
      try {
        if (venteToEdit) {
          await axios.put(`${API_URL}/${venteToEdit.id}`, venteForm);
          showSnackbar("Vente modifiée avec succès");
        } else {
          await axios.post(API_URL, venteForm);
          showSnackbar("Vente créée avec succès");
        }

        // Recharger les ventes
        const ventesRes = await axios.get(API_URL);
        setVentes(ventesRes.data);
        setOpenForm(false);
        setVenteToEdit(null);
        setVenteForm({
          piece_id: "",
          client_id: "",
          quantite: "",
          prix_unitaire: "",
          reduction: 0,
          notes: "",
        });
      } catch (err) {
        showSnackbar("Erreur lors de l'enregistrement", "error");
      }
    };

    const handleEdit = (vente) => {
      if (userRole !== "admin") {
        showSnackbar(
          "Vous n'avez pas la permission de modifier les ventes",
          "error"
        );
        return;
      }
      setVenteToEdit(vente);

      const piece = pieces.find((p) => p.name === vente.piece_nom);
      const client = clients.find(
        (c) => `${c.nom} ${c.prenom}` === vente.client_nom
      );

      setVenteForm({
        piece_id: piece?.id || "",
        client_id: client?.id || "",
        quantite: vente.quantite.toString(),
        prix_unitaire: vente.prix_unitaire.toString(),
        reduction: vente.reduction.toString(),
        notes: vente.notes || "",
      });
      setOpenForm(true);
    };

    const handleDelete = async (id) => {
      if (userRole !== "admin") {
        showSnackbar(
          "Vous n'avez pas la permission de supprimer des ventes",
          "error"
        );
        return;
      }
      try {
        await axios.delete(`${API_URL}/${id}`);
        showSnackbar("Vente supprimée avec succès");
        // Recharger les ventes
        const ventesRes = await axios.get(API_URL);
        setVentes(ventesRes.data);
      } catch (err) {
        showSnackbar("Erreur lors de la suppression", "error");
      }
    };

    const handleViewDetails = (vente) => {
      setSelectedVente(vente);
      setDetailOpen(true);
    };

    // Calcul des statistiques
    const totalVentes = ventes.length;
    const chiffreAffaires = ventes.reduce(
      (sum, vente) => sum + vente.prix_total,
      0
    );
    const ventesAujourd = ventes.filter(
      (v) => v.date_vente === new Date().toISOString().split("T")[0]
    ).length;
    const moyenneVente = totalVentes > 0 ? chiffreAffaires / totalVentes : 0;

    // Filtrage des ventes
    const filteredVentes = ventes.filter((vente) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(vente).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesClient =
        filterClient === "" || vente.client_nom.includes(filterClient);
      const matchesPiece =
        filterPiece === "" || vente.piece_nom.includes(filterPiece);
      const matchesStatus =
        filterStatus === "all" || vente.status === filterStatus;

      let matchesDate = true;
      if (filterDateStart) {
        matchesDate = matchesDate && vente.date_vente >= filterDateStart;
      }
      if (filterDateEnd) {
        matchesDate = matchesDate && vente.date_vente <= filterDateEnd;
      }

      return (
        matchesSearch &&
        matchesClient &&
        matchesPiece &&
        matchesStatus &&
        matchesDate
      );
    });

    const resetFilters = () => {
      setSearchTerm("");
      setFilterClient("");
      setFilterPiece("");
      setFilterDateStart("");
      setFilterDateEnd("");
      setFilterStatus("all");
      setPage(0);
    };

    // Export CSV
    const exportToCSV = () => {
      const headers = [
        "Date",
        "Pièce",
        "Client",
        "Quantité",
        "Prix Unitaire",
        "Réduction",
        "Prix Total",
        "Statut",
        "Notes",
      ].join(",");
      const csvContent = filteredVentes
        .map((vente) =>
          [
            `"${vente.date_vente}"`,
            `"${vente.piece_nom}"`,
            `"${vente.client_nom}"`,
            vente.quantite,
            vente.prix_unitaire,
            vente.reduction,
            vente.prix_total,
            `"${vente.status}"`,
            `"${vente.notes}"`,
          ].join(",")
        )
        .join("\n");

      const blob = new Blob([headers + "\n" + csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ventes-historique.csv";
      link.click();
      showSnackbar("Export CSV généré avec succès");
    };

    return (
      <Fade in timeout={600}>
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          {/* Notification Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* Cartes de statistiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid sx={{}}>
              <StatsCard>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {totalVentes}
                      </Typography>
                      {/* Move subtitle outside h4 */}
                      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                        Ventes Totales
                      </Typography>
                    </Box>
                    <ShoppingCart sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid sx={{}}>
              <StatsCard
                sx={{
                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid sx={{}}>
              <StatsCard
                sx={{
                  background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {ventesAujourd}
                      </Typography>
                      {/* Move subtitle outside h4 */}
                      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                        Ventes Aujourd'hui
                      </Typography>
                    </Box>
                    <DateRange sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid sx={{}}>
              <StatsCard
                sx={{
                  background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {moyenneVente.toFixed(2)}€
                      </Typography>
                      {/* Move subtitle outside h4 */}
                      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                        Panier Moyen
                      </Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 3 }}>
            {/* En-tête */}
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
                color: "white",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ShoppingCart sx={{ fontSize: 40 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Gestion des Ventes
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    Système de vente de pièces automobiles
                  </Typography>
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                <TextField
                  size="small"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "white" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 50,
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      "& .MuiInputBase-input::placeholder": {
                        color: "rgba(255,255,255,0.7)",
                      },
                    },
                  }}
                />

                <Tooltip title="Actualiser">
                  <IconButton sx={{ color: "white" }} onClick={handleRefresh}>
                    {isRefreshing ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <Refresh />
                    )}
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenForm(true)}
                  sx={{
                    borderRadius: 50,
                    background: "rgba(255,255,255,0.2)",
                    "&:hover": { background: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Nouvelle Vente
                </Button>

                <Button
                  variant="contained"
                  onClick={exportToCSV}
                  startIcon={<FileDownload />}
                  sx={{
                    borderRadius: 50,
                    background: "rgba(255,255,255,0.2)",
                    "&:hover": { background: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Box>

            {/* Filtres */}
            <Box
              sx={{
                p: 2,
                background: "rgba(231, 76, 60, 0.05)",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <FilterList sx={{ mr: 1 }} /> Filtres:
              </Typography>

              <TextField
                label="Date début"
                type="date"
                size="small"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <TextField
                label="Date fin"
                type="date"
                size="small"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" onClick={resetFilters} size="small">
                Réinitialiser
              </Button>

              <Typography variant="body2" sx={{ ml: "auto" }}>
                {filteredVentes.length} vente(s) trouvée(s)
              </Typography>
            </Box>

            {/* Tableau des ventes */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(135deg, #2c3e50 0%, #1a2a4a 100%)",
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Pièce
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Client
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Quantité
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Prix Unit.
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Réduction
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Statut
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, index) => (
                      <TableRow key={index}>
                        {[...Array(9)].map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredVentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <ShoppingBag
                            sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                          />
                          <Typography variant="h6" color="text.secondary">
                            Aucune vente trouvée
                          </Typography>
                          <Button
                            onClick={() => setOpenForm(true)}
                            startIcon={<Add />}
                            sx={{ mt: 2 }}
                          >
                            Ajouter une vente
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVentes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((vente) => (
                        <PremiumTableRow key={vente.id}>
                          <TableCell>
                            {new Date(vente.date_vente).toLocaleDateString(
                              "fr-FR"
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={vente.piece_nom}
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Person color="action" />
                              {vente.client_nom}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>
                              {vente.quantite}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Euro color="action" />
                              {Number(vente.prix_unitaire || 0).toFixed(2)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {vente.reduction > 0 ? (
                              <Chip
                                label={`-${vente.reduction}€`}
                                color="secondary"
                                size="small"
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{ fontWeight: 700, color: "success.main" }}
                            >
                              {Number(vente.prix_total || 0).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                vente.status === "completed"
                                  ? "Terminé"
                                  : vente.status === "pending"
                                    ? "En attente"
                                    : "Annulé"
                              }
                              color={
                                vente.status === "completed"
                                  ? "success"
                                  : vente.status === "pending"
                                    ? "warning"
                                    : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Voir détails">
                              <IconButton
                                onClick={() => handleViewDetails(vente)}
                              >
                                <Visibility color="info" />
                              </IconButton>
                            </Tooltip>
                            {userRole === "admin" && (
                              <>
                                <Tooltip title="Modifier">
                                  <IconButton onClick={() => handleEdit(vente)}>
                                    <Edit color="primary" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton
                                    onClick={() => handleDelete(vente.id)}
                                  >
                                    <Delete color="error" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </PremiumTableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredVentes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>

          {/* Dialogue de formulaire de vente */}
          <Dialog
            open={openForm}
            onClose={() => setOpenForm(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5">
                {venteToEdit ? "Modifier la vente" : "Nouvelle vente"}
              </Typography>
              <IconButton onClick={() => setOpenForm(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid sx={{}}>
                  <Autocomplete
                    options={Array.isArray(pieces) ? pieces : []}
                    getOptionLabel={(option) =>
                      `${option.name} (Stock: ${option.stock_quantity})`
                    }
                    value={
                      Array.isArray(pieces)
                        ? pieces.find((p) => p.id === venteForm.piece_id) || null
                        : null
                    }
                    onChange={(event, newValue) => {
                      handleVenteFormChange(
                        "piece_id",
                        newValue ? newValue.id : ""
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pièce *"
                        fullWidth
                        required
                        helperText="Sélectionnez la pièce à vendre"
                      />
                    )}
                  />
                </Grid>

                <Grid sx={{}}>
                  <Autocomplete
                    options={Array.isArray(clients) ? clients : []}
                    getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                    value={
                      Array.isArray(clients)
                        ? clients.find((c) => c.id === venteForm.client_id) ||
                        null
                        : null
                    }
                    onChange={(event, newValue) => {
                      handleVenteFormChange(
                        "client_id",
                        newValue ? newValue.id : ""
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client *"
                        fullWidth
                        required
                        helperText="Sélectionnez le client"
                      />
                    )}
                  />
                </Grid>

                <Grid sx={{}}>
                  <TextField
                    label="Quantité *"
                    type="number"
                    fullWidth
                    required
                    value={venteForm.quantite}
                    onChange={(e) =>
                      handleVenteFormChange("quantite", e.target.value)
                    }
                    inputProps={{ min: 1 }}
                    helperText="Nombre de pièces"
                  />
                </Grid>

                <Grid sx={{}}>
                  <TextField
                    label="Prix unitaire (€) *"
                    type="number"
                    fullWidth
                    required
                    value={venteForm.prix_unitaire}
                    onChange={(e) =>
                      handleVenteFormChange("prix_unitaire", e.target.value)
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Prix par pièce"
                  />
                </Grid>

                <Grid sx={{}}>
                  <TextField
                    label="Réduction (€)"
                    type="number"
                    fullWidth
                    value={venteForm.reduction}
                    onChange={(e) =>
                      handleVenteFormChange("reduction", e.target.value)
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Réduction appliquée"
                  />
                </Grid>

                <Grid sx={{}}>
                  <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    fullWidth
                    value={venteForm.notes}
                    onChange={(e) =>
                      handleVenteFormChange("notes", e.target.value)
                    }
                    helperText="Informations complémentaires"
                  />
                </Grid>

                {venteForm.quantite && venteForm.prix_unitaire && (
                  <Grid sx={{}}>
                    <Card sx={{ backgroundColor: "#f5f5f5", p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Résumé de la vente
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography>Sous-total:</Typography>
                        <Typography>
                          {(
                            parseFloat(venteForm.quantite || 0) *
                            parseFloat(venteForm.prix_unitaire || 0)
                          ).toFixed(2)}{" "}
                          €
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography>Réduction:</Typography>
                        <Typography color="secondary">
                          -{parseFloat(venteForm.reduction || 0).toFixed(2)} €
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary">
                          {(
                            parseFloat(venteForm.quantite || 0) *
                            parseFloat(venteForm.prix_unitaire || 0) -
                            parseFloat(venteForm.reduction || 0)
                          ).toFixed(2)}{" "}
                          €
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenForm(false)}>Annuler</Button>
              <Button
                variant="contained"
                onClick={handleSubmitVente}
                startIcon={<ShoppingCart />}
              >
                {venteToEdit ? "Modifier" : "Enregistrer la vente"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialogue de détail de vente */}
          <Dialog
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5">Détails de la vente</Typography>
              <IconButton onClick={() => setDetailOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selectedVente && (
                <Box sx={{ p: 2 }}>
                  {/* En-tête de la facture */}
                  <Box
                    sx={{
                      textAlign: "center",
                      mb: 4,
                      p: 3,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      FACTURE DE VENTE
                    </Typography>
                    <Typography variant="h6" color="primary">
                      N° {selectedVente.id.toString().padStart(6, "0")}
                    </Typography>
                    <Typography variant="body1">
                      Date:{" "}
                      {new Date(selectedVente.date_vente).toLocaleDateString(
                        "fr-FR"
                      )}
                    </Typography>
                  </Box>

                  <Grid container spacing={4}>
                    {/* Informations client */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                          Informations Client
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Nom:</strong> {selectedVente.client_nom}
                        </Typography>
                        {/* Ici vous pourriez ajouter plus d'infos client si disponibles */}
                      </Card>
                    </Grid>

                    {/* Informations pièce */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          <ShoppingCart sx={{ mr: 1, verticalAlign: "middle" }} />
                          Détails du Produit
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Pièce:</strong> {selectedVente.piece_nom}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Quantité:</strong> {selectedVente.quantite}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Prix unitaire:</strong>{" "}
                          {selectedVente.prix_unitaire.toFixed(2)} €
                        </Typography>
                      </Card>
                    </Grid>

                    {/* Détails financiers */}
                    <Grid item xs={12}>
                      <Card sx={{ p: 3, backgroundColor: "#f0f7ff" }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          <AttachMoney sx={{ mr: 1, verticalAlign: "middle" }} />
                          Détails Financiers
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="body1">Sous-total:</Typography>
                          <Typography variant="body1">
                            {(
                              selectedVente.quantite * selectedVente.prix_unitaire
                            ).toFixed(2)}{" "}
                            €
                          </Typography>
                        </Box>

                        {selectedVente.reduction > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography variant="body1" color="secondary">
                              Réduction:
                            </Typography>
                            <Typography variant="body1" color="secondary">
                              -{selectedVente.reduction.toFixed(2)} €
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h5" color="primary">
                            Total:
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {selectedVente.prix_total.toFixed(2)} €
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Statut et notes */}
                    <Grid item xs={12}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Informations Complémentaires
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Typography variant="body1" sx={{ mr: 2 }}>
                            <strong>Statut:</strong>
                          </Typography>
                          <Chip
                            label={
                              selectedVente.status === "completed"
                                ? "Terminé"
                                : selectedVente.status === "pending"
                                  ? "En attente"
                                  : "Annulé"
                            }
                            color={
                              selectedVente.status === "completed"
                                ? "success"
                                : selectedVente.status === "pending"
                                  ? "warning"
                                  : "error"
                            }
                          />
                        </Box>

                        {selectedVente.notes && (
                          <Box>
                            <Typography variant="body1" gutterBottom>
                              <strong>Notes:</strong>
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: "italic",
                                p: 1,
                                backgroundColor: "#f5f5f5",
                                borderRadius: 1,
                              }}
                            >
                              {selectedVente.notes}
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Actions pour admin */}
                  {userRole === "admin" && (
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={() => {
                          setDetailOpen(false);
                          handleEdit(selectedVente);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={() => {
                          // Ici vous pourriez implémenter l'impression de la facture
                          showSnackbar(
                            "Fonctionnalité d'impression à implémenter",
                            "info"
                          );
                        }}
                      >
                        Imprimer
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          setDetailOpen(false);
                          handleDelete(selectedVente.id);
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    );
  };
};

export default Ventes;