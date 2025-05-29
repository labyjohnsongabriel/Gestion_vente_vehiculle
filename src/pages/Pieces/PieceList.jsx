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
  Grid, // <-- Ajoutez ceci
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Refresh,
  Construction,
  Inventory,
  AttachMoney,
  Category,
  LocalShipping,
  FilterList,
  Close,
  Print,
  FileDownload,
  Visibility,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import PieceForm from "./PieceForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/pieces";
const CATEGORIES_API_URL = "http://localhost:5000/api/categories";
const FOURNISSEURS_API_URL = "http://localhost:5000/api/fournisseurs";
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

const PieceList = () => {
  const [pieces, setPieces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [pieceToEdit, setPieceToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  // Fonction pour afficher les notifications
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Récupérer les informations de l'utilisateur
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(AUTH_API_URL, {
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

  // Récupérer les pièces avec contrôle d'accès
  const fetchPieces = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let piecesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Pour les utilisateurs normaux, filtrer les pièces avec stock > 0
      if (userRole === "user") {
        piecesData = piecesData.filter((piece) => piece.stock_quantity > 0);
      }

      setPieces(piecesData);
    } catch (error) {
      console.error("Erreur lors du chargement des pièces:", error);
      setError(error);
      showSnackbar("Impossible de charger les pièces", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(CATEGORIES_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(
        Array.isArray(response.data) ? response.data : response.data?.data || []
      );
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      showSnackbar("Impossible de charger les catégories", "error");
    }
  };

  // Récupérer les fournisseurs
  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(FOURNISSEURS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFournisseurs(
        Array.isArray(response.data) ? response.data : response.data?.data || []
      );
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs:", error);
      showSnackbar("Impossible de charger les fournisseurs", "error");
    }
  };

  // Initialisation
  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPieces();
      fetchCategories();
      fetchFournisseurs();
    }
  }, [userId, userRole]);

  // Gestion des pièces
  const handleEdit = (piece) => {
    if (userRole !== "admin") {
      showSnackbar(
        "Vous n'avez pas la permission de modifier les pièces",
        "error"
      );
      return;
    }
    setPieceToEdit(piece);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (userRole !== "admin") {
      showSnackbar(
        "Vous n'avez pas la permission de supprimer des pièces",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer cette pièce? <br/><small>Cette action est irréversible.</small></div>`,
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
          fetchPieces();
          showSnackbar("Pièce supprimée avec succès");
        } catch (error) {
          showSnackbar("Échec de la suppression", "error");
        }
      }
    });
  };

  const handleViewDetails = (piece) => {
    setSelectedPiece(piece);
    setDetailOpen(true);
  };

  // Filtres et recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStockFilter = (e) => {
    setFilterStock(e.target.value);
    setPage(0);
  };

  const handleCategoryFilter = (e) => {
    setFilterCategory(e.target.value);
    setPage(0);
  };

  const handleFournisseurFilter = (e) => {
    setFilterFournisseur(e.target.value);
    setPage(0);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterFournisseur("");
    setFilterStock("all");
    setPage(0);
  };

  // Fonction pour déterminer la couleur du stock
  const getStockColor = (quantity) => {
    if (quantity <= 0) return "error";
    if (quantity <= 5) return "warning";
    return "success";
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (quantity) => {
    if (quantity <= 0) return <Warning color="error" />;
    if (quantity <= 5) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      "Référence",
      "Nom",
      "Description",
      "Prix",
      "Stock",
      "Catégorie",
      "Fournisseur",
    ].join(",");

    const csvContent = filteredPieces
      .map((piece) =>
        [
          `"${piece.reference}"`,
          `"${piece.name}"`,
          `"${piece.description}"`,
          piece.price,
          piece.stock_quantity,
          `"${piece.category_name}"`,
          `"${piece.fournisseur_nom}"`,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pieces-inventaire.csv";
    link.click();
    showSnackbar("Export CSV généré avec succès");
  };

  // Impression
  const printList = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Inventaire des Pièces</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #3f51b5; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #3f51b5; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .warning { background-color: #fff3e0; }
            .error { background-color: #ffebee; }
          </style>
        </head>
        <body>
          <h1>Inventaire des Pièces</h1>
          <p>Généré par ${
            userRole === "admin" ? "Administrateur" : "Utilisateur"
          } le ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Fournisseur</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPieces
                .map(
                  (piece) => `
                <tr class="${
                  piece.stock_quantity <= 0
                    ? "error"
                    : piece.stock_quantity <= 5
                    ? "warning"
                    : ""
                }">
                  <td>${piece.reference}</td>
                  <td>${piece.name}</td>
                  <td>${piece.description || "-"}</td>
                  <td>${piece.price} €</td>
                  <td>${piece.stock_quantity}</td>
                  <td>${piece.category_name}</td>
                  <td>${piece.fournisseur_nom}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showSnackbar("Impression lancée");
  };

  // Filtrage des pièces
  const filteredPieces = pieces.filter((piece) => {
    if (!piece) return false;

    // Filtre de recherche
    const matchesSearch =
      searchTerm === "" ||
      [
        "reference",
        "name",
        "description",
        "category_name",
        "fournisseur_nom",
      ].some(
        (field) =>
          piece[field] &&
          piece[field]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

    // Filtres avancés
    const matchesCategory =
      filterCategory === "" || piece.category_id?.toString() === filterCategory;
    const matchesFournisseur =
      filterFournisseur === "" ||
      piece.fournisseur_id?.toString() === filterFournisseur;

    let matchesStock = true;
    if (filterStock === "out") {
      matchesStock = piece.stock_quantity <= 0;
    } else if (filterStock === "low") {
      matchesStock = piece.stock_quantity > 0 && piece.stock_quantity <= 5;
    } else if (filterStock === "available") {
      matchesStock = piece.stock_quantity > 5;
    }

    return (
      matchesSearch && matchesCategory && matchesFournisseur && matchesStock
    );
  });

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
              <Construction sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Gestion des Pièces
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
                alignItems: "center",
                flexWrap: { xs: "wrap", md: "nowrap" },
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
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                }}
              />

              <Tooltip title="Actualiser">
                <IconButton onClick={fetchPieces} sx={{ color: "white" }}>
                  {isRefreshing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>

              {userRole === "admin" && (
                <>
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
                    Nouvelle Pièce
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
                    CSV
                  </Button>

                  <Button
                    variant="contained"
                    onClick={printList}
                    startIcon={<Print />}
                    sx={{
                      borderRadius: 50,
                      background: "rgba(255,255,255,0.2)",
                      "&:hover": { background: "rgba(255,255,255,0.3)" },
                    }}
                  >
                    Imprimer
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Filtres */}
          <Box
            sx={{
              p: 2,
              background: "rgba(63, 81, 181, 0.05)",
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

            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Stock</InputLabel>
              <Select
                value={filterStock}
                onChange={handleStockFilter}
                label="Stock"
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="out">Rupture (0)</MenuItem>
                <MenuItem value="low">Faible (≤ 5)</MenuItem>
                <MenuItem value="available">Disponible (&gt; 5)</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={handleCategoryFilter}
                label="Catégorie"
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={filterFournisseur}
                onChange={handleFournisseurFilter}
                label="Fournisseur"
              >
                <MenuItem value="">Tous les fournisseurs</MenuItem>
                {fournisseurs.map((fournisseur) => (
                  <MenuItem
                    key={fournisseur.id}
                    value={fournisseur.id.toString()}
                  >
                    {fournisseur.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" onClick={resetFilters} size="small">
              Réinitialiser
            </Button>

            <Typography variant="body2" sx={{ ml: "auto" }}>
              {filteredPieces.length} pièce(s) trouvée(s)
            </Typography>
          </Box>

          {/* Tableau */}
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
                    Image
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Référence
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Nom
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Prix
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Stock
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Catégorie
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Fournisseur
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
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Construction
                          sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                        />
                        <Typography variant="h6" color="error">
                          Erreur de connexion au serveur
                        </Typography>
                        <Button
                          onClick={fetchPieces}
                          startIcon={<Refresh />}
                          sx={{ mt: 2 }}
                          variant="outlined"
                        >
                          Réessayer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredPieces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Inventory
                          sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          {searchTerm ||
                          filterCategory ||
                          filterFournisseur ||
                          filterStock !== "all"
                            ? "Aucune pièce correspondante"
                            : "Aucune pièce trouvée"}
                        </Typography>
                        {userRole === "admin" && (
                          <Button
                            onClick={() => setOpenForm(true)}
                            startIcon={<Add />}
                            sx={{ mt: 2 }}
                          >
                            Ajouter une pièce
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPieces
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((piece) => (
                      <PremiumTableRow key={piece.id}>
                        <TableCell>
                          <Avatar
                            src={piece.image || "/default-part.png"}
                            sx={{
                              width: 50,
                              height: 50,
                              mx: "auto",
                              border: "2px solid #5C6BC0",
                            }}
                            variant="rounded"
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={piece.reference}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {piece.name}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={piece.description || "Aucune description"}
                          >
                            <Typography noWrap sx={{ maxWidth: 200 }}>
                              {piece.description?.substring(0, 30) || "-"}
                              {piece.description?.length > 30 ? "..." : ""}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <AttachMoney color="action" />
                            {parseFloat(piece.price || 0).toFixed(2)} €
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getStatusIcon(piece.stock_quantity)}
                            <Typography>{piece.stock_quantity}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={piece.category_name}
                            icon={<Category fontSize="small" />}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={piece.fournisseur_nom}
                            icon={<LocalShipping fontSize="small" />}
                            variant="outlined"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Voir détails">
                            <IconButton
                              onClick={() => handleViewDetails(piece)}
                            >
                              <Visibility color="info" />
                            </IconButton>
                          </Tooltip>

                          {userRole === "admin" && (
                            <>
                              <Tooltip title="Modifier">
                                <IconButton onClick={() => handleEdit(piece)}>
                                  <Edit color="primary" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDelete(piece.id)}
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

          {!error && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPieces.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </Paper>

        {/* Formulaire d'édition/ajout */}
        <PieceForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setPieceToEdit(null);
          }}
          refreshPieces={fetchPieces}
          pieceToEdit={pieceToEdit}
          categories={categories}
          fournisseurs={fournisseurs}
          userRole={userRole}
        />

        {/* Dialogue de détail */}
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
            <Typography variant="h5">Détails de la pièce</Typography>
            <IconButton onClick={() => setDetailOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedPiece && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Avatar
                    src={selectedPiece.image || "/default-part.png"}
                    sx={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 300,
                      borderRadius: 2,
                    }}
                    variant="rounded"
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom>
                    {selectedPiece.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Référence: {selectedPiece.reference}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" paragraph>
                      {selectedPiece.description ||
                        "Aucune description disponible"}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2">Prix</Typography>
                      <Typography variant="h6" color="primary">
                        {parseFloat(selectedPiece.price || 0).toFixed(2)} €
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2">Stock</Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getStatusIcon(selectedPiece.stock_quantity)}
                        <Typography variant="h6">
                          {selectedPiece.stock_quantity}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2">Catégorie</Typography>
                      <Typography variant="h6">
                        {selectedPiece.category_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="subtitle2">Fournisseur</Typography>
                      <Typography variant="h6">
                        {selectedPiece.fournisseur_nom}
                      </Typography>
                    </Grid>
                  </Grid>

                  {userRole === "admin" && (
                    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={() => {
                          setDetailOpen(false);
                          handleEdit(selectedPiece);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          setDetailOpen(false);
                          handleDelete(selectedPiece.id);
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
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

export default PieceList;
