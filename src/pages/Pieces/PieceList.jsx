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
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import PieceForm from "./PieceForm";
import axios from "axios";

const API_URL = "http://localhost:5000/api/pieces";
const CATEGORIES_API_URL = "http://localhost:5000/api/categories";
const FOURNISSEURS_API_URL = "http://localhost:5000/api/fournisseurs";

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

  const fetchPieces = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);

      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setPieces(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setPieces(response.data.data);
      } else {
        setPieces([]);
        console.warn(
          "La réponse de l'API n'est pas au format attendu:",
          response.data
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pièces:", error);
      setError(error);
      Swal.fire("Erreur", "Impossible de charger les pièces", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORIES_API_URL);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
        console.warn(
          "La réponse de l'API n'est pas au format attendu pour les catégories:",
          response.data
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      Swal.fire("Erreur", "Impossible de charger les catégories", "error");
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(FOURNISSEURS_API_URL);
      if (Array.isArray(response.data)) {
        setFournisseurs(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setFournisseurs(response.data.data);
      } else {
        setFournisseurs([]);
        console.warn(
          "La réponse de l'API n'est pas au format attendu pour les fournisseurs:",
          response.data
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs:", error);
      Swal.fire("Erreur", "Impossible de charger les fournisseurs", "error");
    }
  };

  useEffect(() => {
    fetchPieces();
    fetchCategories();
    fetchFournisseurs();
  }, []);

  const handleEdit = (piece) => {
    setPieceToEdit(piece);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
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
          await axios.delete(`${API_URL}/${id}`);
          fetchPieces();
          Swal.fire("Supprimé!", "La pièce a été supprimée.", "success");
        } catch (error) {
          Swal.fire("Erreur", "La suppression a échoué.", "error");
        }
      }
    });
  };

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

  const filteredPieces = pieces.filter((piece) => {
    if (!piece) return false;

    // Filtrer par terme de recherche
    const searchFields = [
      "image",
      "reference",
      "name",
      "description",
      "price",
      "stock_quantity",
      "category_name",
      "fournisseur_name",
    ];

    const matchesSearch =
      searchTerm === "" ||
      searchFields.some(
        (field) =>
          piece[field] &&
          piece[field]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

    // Filtrer par catégorie
    const matchesCategory =
      filterCategory === "" ||
      piece.category_id === parseInt(filterCategory) ||
      piece.category_name === filterCategory;

    // Filtrer par fournisseur
    const matchesFournisseur =
      filterFournisseur === "" ||
      piece.fournisseur_id === parseInt(filterFournisseur) ||
      piece.fournisseur_name === filterFournisseur;

    // Filtrer par stock
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

  const getStockColor = (quantity) => {
    if (quantity <= 0) return "error";
    if (quantity <= 5) return "warning";
    return "success";
  };

  // Fonction pour exporter les données en CSV
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
          `"${piece.fournisseur_name}"`,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pieces-inventaire.csv";
    link.click();
  };

  // Fonction pour imprimer la liste
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
          </style>
        </head>
        <body>
          <h1>Inventaire des Pièces</h1>
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
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
                <tr>
                  <td>${piece.reference}</td>
                  <td>${piece.name}</td>
                  <td>${piece.price} €</td>
                  <td>${piece.stock_quantity}</td>
                  <td>${piece.category_name}</td>
                  <td>${piece.fournisseur_name}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <p>Généré le ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 3 }}>
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
                sx={{
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.2)",
                  "&:hover": { background: "rgba(255,255,255,0.3)" },
                  ml: 1,
                }}
              >
                Exporter CSV
              </Button>

              <Button
                variant="contained"
                onClick={printList}
                sx={{
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.2)",
                  "&:hover": { background: "rgba(255,255,255,0.3)" },
                  ml: 1,
                }}
              >
                Imprimer
              </Button>
            </Box>
          </Box>

          {/* Section de filtres */}
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
                    {fournisseur.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" onClick={resetFilters} size="small">
              Réinitialiser les filtres
            </Button>

            <Typography variant="body2" sx={{ ml: "auto" }}>
              {filteredPieces.length} pièce(s) trouvée(s)
            </Typography>
          </Box>

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
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          Impossible de se connecter à l'API
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
                        <Button
                          onClick={() => setOpenForm(true)}
                          startIcon={<Add />}
                          sx={{ mt: 2 }}
                        >
                          Ajouter une pièce
                        </Button>
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
                            src={
                              piece.image && piece.image !== ""
                                ? piece.image.startsWith("http")
                                  ? piece.image
                                  : `http://localhost:5000${piece.image}`
                                : "/default-part.png"
                            }
                            sx={{ width: 56, height: 56 }}
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
                          <Tooltip title={piece.description}>
                            <Typography noWrap sx={{ maxWidth: 200 }}>
                              {piece.description?.substring(0, 30)}
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
                            {typeof piece.price === "number"
                              ? piece.price.toFixed(2)
                              : parseFloat(piece.price || 0).toFixed(2)}{" "}
                            €
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge
                            badgeContent={piece.stock_quantity}
                            color={getStockColor(piece.stock_quantity)}
                            sx={{
                              "& .MuiBadge-badge": { right: -15, top: 15 },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={piece.category_name}
                            icon={<Category fontSize="small" />}
                            variant="outlined"
                            onClick={() =>
                              setFilterCategory(piece.category_id.toString())
                            }
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={piece.fournisseur_name}
                            icon={<LocalShipping fontSize="small" />}
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              setFilterFournisseur(
                                piece.fournisseur_id.toString()
                              )
                            }
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton onClick={() => handleEdit(piece)}>
                              <Edit color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton onClick={() => handleDelete(piece.id)}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
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
        />
      </Box>
    </Fade>
  );
};

export default PieceList;
