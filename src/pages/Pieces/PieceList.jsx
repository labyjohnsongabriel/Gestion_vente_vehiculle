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
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import PieceForm from "./PieceForm";
import axios from "axios";

const API_URL = "http://localhost:5000/api/pieces";

const axiosWithAuth = axios.create();
axiosWithAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PremiumTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    background: "linear-gradient(90deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)",
  },
  "&:hover": {
    background: "linear-gradient(90deg, rgba(225,245,255,1) 0%, rgba(255,255,255,1) 100%)",
    transform: "scale(1.005)",
    boxShadow: theme.shadows[1],
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
}));

const PieceList = () => {
  const [pieces, setPieces] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [pieceToEdit, setPieceToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchPieces = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setAuthError(false);
      
      const response = await axiosWithAuth.get(API_URL);
      setPieces(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des pièces:", error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        Swal.fire({
          title: "Erreur d'authentification",
          text: "Veuillez vous reconnecter",
          icon: "error",
          confirmButtonText: "Se connecter",
        }).then(() => window.location.href = "/login");
      } else {
        Swal.fire("Erreur", "Impossible de charger les pièces", "error");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPieces();
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
          await axiosWithAuth.delete(`${API_URL}/${id}`);
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

  const filteredPieces = pieces.filter((piece) =>
    Object.values(piece).some(
      (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const getStockColor = (quantity) => {
    if (quantity <= 0) return "error";
    if (quantity <= 5) return "warning";
    return "success";
  };

  if (authError) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: "auto" }}>
          <Construction sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Erreur d'authentification
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = "/login"}
          >
            Se connecter
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 3 }}>
          <Box sx={{ 
            p: 3, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            background: "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
            color: "white"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Construction sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Gestion des Pièces
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                  {isRefreshing ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
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
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(135deg, #2c3e50 0%, #1a2a4a 100%)" }}>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Image</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Référence</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Prix</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Stock</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Catégorie</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>Fournisseur</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
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
                ) : filteredPieces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Inventory sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          Aucune pièce trouvée
                        </Typography>
                        <Button onClick={() => setOpenForm(true)} startIcon={<Add />} sx={{ mt: 2 }}>
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
                            src={piece.image || "/default-part.png"} 
                            sx={{ width: 56, height: 56 }}
                            variant="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={piece.reference} color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{piece.name}</TableCell>
                        <TableCell>
                          <Tooltip title={piece.description}>
                            <Typography noWrap sx={{ maxWidth: 200 }}>
                              {piece.description?.substring(0, 30)}{piece.description?.length > 30 ? "..." : ""}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AttachMoney color="action" />
                            {piece.price.toFixed(2)} €
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge
                            badgeContent={piece.stock_quantity}
                            color={getStockColor(piece.stock_quantity)}
                            sx={{ "& .MuiBadge-badge": { right: -15, top: 15 } }}
                          />
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
                            label={piece.fournisseur_name} 
                            icon={<LocalShipping fontSize="small" />} 
                            variant="outlined"
                            color="secondary"
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
        </Paper>

        <PieceForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshPieces={fetchPieces}
          pieceToEdit={pieceToEdit}
        />
      </Box>
    </Fade>
  );
};

export default PieceList;