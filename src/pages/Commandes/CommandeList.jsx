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
  Slide,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  FilterList,
  Refresh,
  ShoppingCart,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import CommandeForm from "./CommandeForm";
import axios from "axios";

const API_URL = "http://localhost:5000/api/commandes";

// Composants stylisés premium
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

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [commandeToEdit, setCommandeToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get(API_URL);
      setCommandes(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      Swal.fire("Erreur", "Impossible de charger les commandes", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleEdit = (commande) => {
    setCommandeToEdit(commande);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
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
          await axios.delete(`${API_URL}/${id}`);
          fetchCommandes();
          Swal.fire({
            title: "Supprimé!",
            text: "La commande a été supprimée avec succès.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
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
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredCommandes = commandes.filter((cmd) =>
    Object.values(cmd).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredCommandes.length - page * rowsPerPage);

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
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
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Gestion des Commandes
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
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
                  },
                }}
                sx={{ minWidth: 250 }}
              />

              <Tooltip title="Actualiser">
                <IconButton onClick={handleRefresh} sx={{ color: "white" }}>
                  {isRefreshing ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>

              <PremiumButton
                startIcon={<Add />}
                onClick={handleAddCommande}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                Nouvelle Commande
              </PremiumButton>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#3a4b6d" }}>
              
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Utilisateur
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Date
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
                      {[...Array(5)].map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      ))}
                    </PremiumTableRow>
                  ))
                ) : filteredCommandes.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <ShoppingCart
                          sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Aucune commande trouvée
                        </Typography>
                        <PremiumButton
                          onClick={handleAddCommande}
                          startIcon={<Add />}
                        >
                          Créer une commande
                        </PremiumButton>
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
                      >
                        <TableRow>
                      
                          <TableCell>{commande.client_name}</TableCell>
                          <TableCell>{commande.user_name}</TableCell>
                          <TableCell>
                            {new Date(commande.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => handleEdit(commande)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDelete(commande.id)}
                                  sx={{ color: "#ff4444" }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
          />
        </Paper>

        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "block", sm: "none" },
          }}
        >
          <Tooltip title="Ajouter une commande">
            <Button
              variant="contained"
              onClick={handleAddCommande}
              sx={{
                borderRadius: "50%",
                width: 60,
                height: 60,
                minWidth: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Add sx={{ fontSize: 28 }} />
            </Button>
          </Tooltip>
        </Box>

        <CommandeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshCommandes={fetchCommandes}
          commandeToEdit={commandeToEdit}
        />
      </Box>
    </Fade>
  );
};

export default CommandeList;
