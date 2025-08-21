import React, { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
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
  Divider,
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Fade,
  Slide,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  FilterList,
  Refresh,
  ShoppingCart,
  Visibility,
  Close,
  Person,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  Print,
  Notes,
  CheckCircle,
  Schedule,
  Warning,
  Inventory,
  TrendingUp,
  Analytics,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import CommandeForm from "./CommandeForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const STATS_API_URL = "http://localhost:5000/api/commandes/stats";

// Style personnalisé
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
  "&.MuiTableRow-root": {
    opacity: 0,
    animation: "$fadeInRow 0.6s ease forwards",
  },
  "@keyframes fadeInRow": {
    "0%": { opacity: 0, transform: "translateX(-30px)" },
    "100%": { opacity: 1, transform: "translateX(0)" },
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
  },
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
}));

const API_URL = "http://localhost:5000/api/commandes";
const STOCK_API_URL = "http://localhost:5000/api/stock";
const USER_API_URL = "http://localhost:5000/api/auth/me";

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [commandeToEdit, setCommandeToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [stockData, setStockData] = useState({});
  const [statusFilter, setStatusFilter] = useState("tous");
  const [statsOpen, setStatsOpen] = useState(false);
  const [commandeStats, setCommandeStats] = useState({});
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Statuts disponibles avec leurs propriétés
  const statusOptions = [
    {
      value: "en_preparation",
      label: "En préparation",
      color: "warning",
      icon: Schedule,
    },
    { value: "valide", label: "Validé", color: "info", icon: CheckCircle },
    { value: "livre", label: "Livré", color: "success", icon: LocalShipping },
    { value: "annule", label: "Annulé", color: "error", icon: Warning },
  ];

  // Récupérer les informations de l'utilisateur connecté
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(USER_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.role);
      setUserId(response.data.id);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        error
      );
      navigate("/login");
    }
  };

  // Récupérer les commandes selon le rôle
  const fetchCommandes = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);

      const token = localStorage.getItem("token");
      let url = API_URL;

      // Si utilisateur standard, ne récupérer que ses commandes
      if (userRole === "user") {
        url = `${API_URL}/user/${userId}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommandes(response.data);

      // Calculer les statistiques seulement pour les admins
      if (userRole === "admin") {
        calculateStats(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      Swal.fire("Erreur", "Impossible de charger les commandes", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(STOCK_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stockMap = {};
      response.data.forEach((item) => {
        stockMap[item.piece_id] = {
          quantity: item.quantity,
          seuil_alerte: item.seuil_alerte,
          status: item.quantity <= item.seuil_alerte ? "critique" : "normal",
        };
      });
      setStockData(stockMap);
    } catch (error) {
      console.error("Erreur lors du chargement du stock:", error);
    }
  };

  const fetchCommandeDetails = async (commandeId) => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/${commandeId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Enrichir les détails avec les données de stock
      const enrichedDetails = response.data.map((detail) => ({
        ...detail,
        stock: stockData[detail.piece_id] || { quantity: 0, status: "inconnu" },
      }));

      setDetails(enrichedDetails);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      Swal.fire("Erreur", "Impossible de charger les détails", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(STATS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommandeStats(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const calculateStats = (commandesData) => {
    const stats = {
      total: commandesData.length,
      en_preparation: commandesData.filter((c) => c.status === "en_preparation")
        .length,
      valide: commandesData.filter((c) => c.status === "valide").length,
      livre: commandesData.filter((c) => c.status === "livre").length,
      annule: commandesData.filter((c) => c.status === "annule").length,
      montant_total: commandesData.reduce(
        (sum, c) => sum + (c.montant || 0),
        0
      ),
      montant_livre: commandesData
        .filter((c) => c.status === "livre")
        .reduce((sum, c) => sum + (c.montant || 0), 0),
    };
    setCommandeStats(stats);
  };

  const updateCommandeStatus = async (commandeId, newStatus) => {
    if (userRole !== "admin") {
      Swal.fire(
        "Erreur",
        "Vous n'avez pas la permission de modifier le statut",
        "error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/${commandeId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "Statut mis à jour!",
        text: `Le statut de la commande a été changé vers ${
          statusOptions.find((s) => s.value === newStatus)?.label
        }.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      fetchCommandes();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      Swal.fire("Erreur", "Impossible de mettre à jour le statut", "error");
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = statusOptions.find((s) => s.value === status) || {
      value: "en_preparation",
      label: "En préparation",
      color: "warning",
      icon: Schedule,
    };

    const IconComponent = statusConfig.icon;

    return (
      <Chip
        icon={<IconComponent fontSize="small" />}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        sx={{
          borderRadius: 1,
          fontWeight: 600,
          textTransform: "capitalize",
          minWidth: 120,
          justifyContent: "center",
        }}
      />
    );
  };

  const getStockAlert = (stock) => {
    if (!stock || stock.status === "inconnu") return null;

    if (stock.status === "critique") {
      return (
        <Alert severity="error" size="small" sx={{ mt: 1 }}>
          Stock critique: {stock.quantity} unités
        </Alert>
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Inventory fontSize="small" color="success" />
        <Typography variant="caption" sx={{ ml: 1 }}>
          Stock: {stock.quantity} unités
        </Typography>
      </Box>
    );
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCommandes();
      fetchStock();
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (userRole === "admin") {
      fetchStats();
    }
  }, [userRole]);

  const handleEdit = (commande) => {
    if (userRole !== "admin" && commande.user_id !== userId) {
      Swal.fire(
        "Erreur",
        "Vous ne pouvez modifier que vos propres commandes",
        "error"
      );
      return;
    }
    setCommandeToEdit(commande);
    setOpenForm(true);
  };

  const handleViewDetails = async (commande) => {
    if (userRole === "user" && commande.user_id !== userId) {
      Swal.fire(
        "Erreur",
        "Vous ne pouvez voir que vos propres commandes",
        "error"
      );
      return;
    }
    setSelectedCommande(commande);
    await fetchCommandeDetails(commande.id);
    setDetailsOpen(true);
  };

  const handleDelete = async (id) => {
    if (userRole !== "admin") {
      Swal.fire(
        "Erreur",
        "Vous n'avez pas la permission de supprimer des commandes",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer cette commande? <br/><small>Cette action est irréversible.</small></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4444",
      cancelButtonColor: "#9e9e9e",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchCommandes();
          Swal.fire({
            title: "Supprimé!",
            text: "La commande a été supprimée avec succès.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire("Erreur", "La suppression a échoué.", "error");
        }
      }
    });
  };

  const handleAddCommande = () => {
    setCommandeToEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCommandes();
    fetchStock();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const filteredCommandes = commandes.filter((cmd) => {
    const matchesSearch = Object.values(cmd).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      statusFilter === "tous" || cmd.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredCommandes.length - page * rowsPerPage);

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
{/*
        {userRole === "admin" && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h6" color="primary">
                    {commandeStats.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Commandes
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h6" color="warning.main">
                    {commandeStats.en_preparation || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En Préparation
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {commandeStats.livre || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Livrées
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {commandeStats.montant_total?.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }) || "0 €"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chiffre d'Affaires
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
      )}
*/}  
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            border: "none",
            background: "linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)",
          }}
        >
          {/* Header premium */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Gestion des Commandes
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  Connecté en tant que{" "}
                  {userRole === "admin" ? "Administrateur" : "Utilisateur"}
                </Typography>
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "white" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 50,
                    pl: 1.5,
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                }}
                sx={{
                  flexGrow: { xs: 1, sm: 0 },
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 50,
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  sx={{
                    borderRadius: 50,
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiSelect-icon": { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  <MenuItem value="tous">Tous les statuts</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Actualiser" arrow>
                <IconButton
                  onClick={handleRefresh}
                  sx={{ color: "white" }}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>

          { /*   {userRole === "admin" && (
                <Tooltip title="Statistiques" arrow>
                  <IconButton
                    onClick={() => setStatsOpen(true)}
                    sx={{ color: "white" }}
                  >
                    <Analytics />
                  </IconButton>
                </Tooltip>
              )}*/}

              {userRole === "admin" && (
                <PremiumButton
                  startIcon={<Add />}
                  onClick={handleAddCommande}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Nouvelle Commande
                </PremiumButton>
              )}
            </Box>
          </Box>

          {/* Tableau premium */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #3a4b6d 0%, #1a2a4a 100%)",
                  }}
                >
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Client
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Responsable
                    </TableCell>
                  )}
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Montant
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Date
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
                    <PremiumTableRow key={index}>
                      {[...Array(userRole === "admin" ? 6 : 5)].map(
                        (_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        )
                      )}
                    </PremiumTableRow>
                  ))
                ) : filteredCommandes.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell
                      colSpan={userRole === "admin" ? 6 : 5}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <ShoppingCart
                          sx={{
                            fontSize: 60,
                            color: "text.disabled",
                            mb: 1,
                            opacity: 0.5,
                          }}
                        />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Aucune commande trouvée
                        </Typography>
                        {userRole === "admin" && (
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              Essayez d'ajouter une nouvelle commande
                            </Typography>
                            <PremiumButton
                              onClick={handleAddCommande}
                              startIcon={<Add />}
                            >
                              Créer une commande
                            </PremiumButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredCommandes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((commande) => (
                      <Slide
                        key={commande.id}
                        direction="up"
                        in
                        mountOnEnter
                        unmountOnExit
                        timeout={600}
                      >
                        <TableRow
                          sx={{
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#f9f9f9",
                            },
                            "&:nth-of-type(even)": {
                              backgroundColor: "#ffffff",
                            },
                            "&:hover": {
                              backgroundColor: "#f1f1f1",
                            },
                          }}
                        >
                          <TableCell sx={{ color: "#3a4b6d" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{ bgcolor: "#667eea", color: "white" }}
                              >
                                {commande.client_name?.charAt(0)}
                              </Avatar>
                              <Typography fontWeight={600}>
                                {commande.client_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          {userRole === "admin" && (
                            <TableCell sx={{ color: "#3a4b6d" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{ bgcolor: "#4caf50", color: "white" }}
                                >
                                  {commande.user_name?.charAt(0)}
                                </Avatar>
                                <Typography>{commande.user_name}</Typography>
                              </Box>
                            </TableCell>
                          )}
                          <TableCell sx={{ color: "#3a4b6d" }}>
                            {commande.montant.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </TableCell>

                          <TableCell sx={{ color: "#3a4b6d" }}>
                            {new Date(commande.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: "#3a4b6d" }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {getStatusChip(commande.status)}
                              {userRole === "admin" && (
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 120 }}
                                >
                                  <Select
                                    value={commande.status || "en_preparation"}
                                    onChange={(e) =>
                                      updateCommandeStatus(
                                        commande.id,
                                        e.target.value
                                      )
                                    }
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    {statusOptions.map((option) => (
                                      <MenuItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Voir détails" arrow>
                                <IconButton
                                  onClick={() => handleViewDetails(commande)}
                                  sx={{
                                    color: "#3a4b6d",
                                    "&:hover": {
                                      color: "#2196f3",
                                      transform: "scale(1.2)",
                                    },
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {(userRole === "admin" ||
                                commande.user_id === userId) && (
                                <Tooltip title="Modifier" arrow>
                                  <IconButton
                                    onClick={() => handleEdit(commande)}
                                    sx={{
                                      color: "#3a4b6d",
                                      "&:hover": {
                                        color: "#667eea",
                                        transform: "scale(1.2)",
                                      },
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {userRole === "admin" && (
                                <Tooltip title="Supprimer" arrow>
                                  <IconButton
                                    onClick={() => handleDelete(commande.id)}
                                    sx={{
                                      color: "#ff4444",
                                      "&:hover": {
                                        transform: "scale(1.2)",
                                      },
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    ))
                )}

                {!loading && emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={userRole === "admin" ? 6 : 5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination premium */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCommandes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: "1px solid rgba(0,0,0,0.05)",
              "& .MuiTablePagination-toolbar": {
                flexWrap: "wrap",
                justifyContent: "center",
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#3a4b6d",
                  fontWeight: 500,
                },
            }}
          />
        </Paper>

        {/* Bouton mobile premium (seulement pour admin) */}
        {userRole === "admin" && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              display: { xs: "block", sm: "none" },
              zIndex: 1000,
            }}
          >
            <Tooltip title="Ajouter une commande" arrow>
              <Button
                variant="contained"
                onClick={handleAddCommande}
                sx={{
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  minWidth: 0,
                  boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Add sx={{ fontSize: 28 }} />
              </Button>
            </Tooltip>
          </Box>
        )}

        {/* Modal des détails */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
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
                Détails de la commande #{selectedCommande?.id}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={() => window.print()}
                sx={{ color: "white", mr: 1 }}
              >
                <Print />
              </IconButton>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setDetailsOpen(false)}
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
            {detailsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <>
                {/* Header amélioré avec icône et boutons d'action */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    background:
                      "linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    <LocalShipping sx={{ verticalAlign: "middle", mr: 1 }} />
                    Détails de la Commande #{selectedCommande?.id}
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      sx={{ mr: 2, borderRadius: 2 }}
                      onClick={() => window.print()}
                    >
                      Imprimer
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Close />}
                      sx={{ borderRadius: 2 }}
                      onClick={() => setDetailsOpen(false)}
                    >
                      Fermer
                    </Button>
                  </Box>
                </Box>

                {/* Section Informations générales avec mise en page améliorée */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    background: "#ffffff",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <InfoIcon color="primary" />
                    Informations Générales
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Client */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(102, 126, 234, 0.05)",
                          borderLeft: "4px solid #667eea",
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          <Person
                            fontSize="small"
                            sx={{ verticalAlign: "middle", mr: 1 }}
                          />
                          Client
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ mt: 0.5 }}
                        >
                          {selectedCommande?.client_name}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Responsable (seulement pour admin) */}
                    {userRole === "admin" && (
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "rgba(76, 175, 80, 0.05)",
                            borderLeft: "4px solid #4caf50",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            <Person
                              fontSize="small"
                              sx={{ verticalAlign: "middle", mr: 1 }}
                            />
                            Responsable
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{ mt: 0.5 }}
                          >
                            {selectedCommande?.user_name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Date */}
                    <Grid item xs={12} md={userRole === "admin" ? 6 : 12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(255, 152, 0, 0.05)",
                          borderLeft: "4px solid #ff9800",
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          <CalendarToday
                            fontSize="small"
                            sx={{ verticalAlign: "middle", mr: 1 }}
                          />
                          Date de commande
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ mt: 0.5 }}
                        >
                          {new Date(
                            selectedCommande?.created_at
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Montant */}
                    <Grid item xs={12} md={userRole === "admin" ? 6 : 12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(33, 150, 243, 0.05)",
                          borderLeft: "4px solid #2196f3",
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          <AttachMoney
                            fontSize="small"
                            sx={{ verticalAlign: "middle", mr: 1 }}
                          />
                          Montant total
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ mt: 0.5 }}
                        >
                          {selectedCommande?.montant?.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Statut avec plus de détails */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background:
                            selectedCommande?.status === "livre"
                              ? "rgba(76, 175, 80, 0.08)"
                              : selectedCommande?.status === "annule"
                              ? "rgba(244, 67, 54, 0.08)"
                              : "rgba(255, 152, 0, 0.08)",
                          borderLeft: "4px solid",
                          borderColor:
                            selectedCommande?.status === "livre"
                              ? "#4caf50"
                              : selectedCommande?.status === "annule"
                              ? "#f44336"
                              : "#ff9800",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              <LocalShipping
                                fontSize="small"
                                sx={{ verticalAlign: "middle", mr: 1 }}
                              />
                              Statut de la commande
                            </Typography>
                            <Chip
                              label={
                                statusOptions.find(
                                  (s) => s.value === selectedCommande?.status
                                )?.label || selectedCommande?.status
                              }
                              color={
                                selectedCommande?.status === "livre"
                                  ? "success"
                                  : selectedCommande?.status === "annule"
                                  ? "error"
                                  : "warning"
                              }
                              size="medium"
                              sx={{
                                fontWeight: 600,
                                mt: 1,
                                px: 2,
                                py: 1,
                                fontSize: "0.875rem",
                              }}
                            />
                          </Box>
                          {userRole === "admin" &&
                            selectedCommande?.status !== "livre" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ borderRadius: 2 }}
                                onClick={() => {
                                  const newStatus =
                                    selectedCommande?.status ===
                                    "en_preparation"
                                      ? "valide"
                                      : "livre";
                                  updateCommandeStatus(
                                    selectedCommande.id,
                                    newStatus
                                  );
                                  setDetailsOpen(false);
                                }}
                              >
                                Mettre à jour le statut
                              </Button>
                            )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Section Articles commandés avec design amélioré */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    background: "#ffffff",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ShoppingCart color="primary" />
                    Articles Commandés
                  </Typography>

                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: "none",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            background:
                              "linear-gradient(135deg, #3a4b6d 0%, #1a2a4a 100%)",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: "white",
                              fontSize: "0.875rem",
                            }}
                          >
                            Article
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: "white",
                              fontSize: "0.875rem",
                            }}
                          >
                            Quantité
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: "white",
                              fontSize: "0.875rem",
                            }}
                          >
                            Prix unitaire
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: "white",
                              fontSize: "0.875rem",
                            }}
                          >
                            Total
                          </TableCell>
                          {userRole === "admin" && (
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "white",
                                fontSize: "0.875rem",
                              }}
                            >
                              Stock
                            </TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {details.map((detail) => (
                          <TableRow key={detail.id} hover>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {detail.piece_name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight={600}>
                                    {detail.piece_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Réf: {detail.piece_id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={detail.quantity}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {detail.price?.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                minimumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600}>
                                {(
                                  detail.price * detail.quantity
                                )?.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                  minimumFractionDigits: 2,
                                })}
                              </Typography>
                            </TableCell>
                            {userRole === "admin" && (
                              <TableCell>
                                {getStockAlert(detail.stock)}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                        <TableRow
                          sx={{
                            background: "rgba(0,0,0,0.02)",
                            "& td": {
                              fontWeight: 600,
                              fontSize: "0.9375rem",
                            },
                          }}
                        >
                          <TableCell
                            colSpan={userRole === "admin" ? 3 : 2}
                            align="right"
                          >
                            Total général
                          </TableCell>
                          <TableCell
                            align="right"
                            colSpan={userRole === "admin" ? 2 : 1}
                          >
                            {selectedCommande?.montant?.toLocaleString(
                              "fr-FR",
                              {
                                style: "currency",
                                currency: "EUR",
                                minimumFractionDigits: 2,
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Section supplémentaire pour les notes ou commentaires */}
                <Box
                  sx={{
                    p: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    background: "#ffffff",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Notes color="primary" />
                    Notes supplémentaires
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    {selectedCommande?.notes ||
                      "Aucune note supplémentaire pour cette commande."}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <Button
              onClick={() => setDetailsOpen(false)}
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
              onClick={() => window.print()}
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
        </Dialog>

        {/* Modal du formulaire */}
        <CommandeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshCommandes={fetchCommandes}
          commandeToEdit={commandeToEdit}
          userRole={userRole}
          userId={userId}
        />
      </Box>
    </Fade>
  );
};

export default CommandeList;
