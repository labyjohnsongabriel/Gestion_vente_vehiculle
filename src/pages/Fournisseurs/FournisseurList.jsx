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
  Business,
  DateRange,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import FournisseurForm from "./FournisseurForm";
import axios from "axios";

const API_URL = "http://localhost:5000/api/fournisseurs";

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

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [fournisseurToEdit, setFournisseurToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get(API_URL);
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs:", error);
      Swal.fire("Erreur", "Impossible de charger les fournisseurs", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleEdit = (fournisseur) => {
    setFournisseurToEdit(fournisseur);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer ce fournisseur? <br/><small>Cette action est irréversible.</small></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4444",
      cancelButtonColor: "#9e9e9e",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: "#ffffff",
      backdrop: `
        rgba(0,0,0,0.6)
        url("/images/trash-animation.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup: "animated pulse",
        confirmButton: "swal-confirm-btn",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          fetchFournisseurs();
          Swal.fire({
            title: "Supprimé!",
            text: "Le fournisseur a été supprimé avec succès.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
            timerProgressBar: true,
            background: "#4caf50",
            color: "white",
          });
        } catch (error) {
          Swal.fire("Erreur", "La suppression a échoué.", "error");
        }
      }
    });
  };

  const handleAddFournisseur = () => {
    setFournisseurToEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFournisseurs();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    // Filtre par recherche texte
    const matchesSearch = Object.values(fournisseur).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtre par date si les deux dates sont définies
    if (startDate && endDate && fournisseur.date_ajout) {
      const fournisseurDate = new Date(fournisseur.date_ajout);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return (
        matchesSearch && fournisseurDate >= start && fournisseurDate <= end
      );
    }

    return matchesSearch;
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredFournisseurs.length - page * rowsPerPage);

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            border: "none",
            background: "linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)",
          }}
          className="premium-paper"
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
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Business sx={{ fontSize: 40 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Gestion des Fournisseurs
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
                  minWidth: 250,
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

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Tooltip title="Filtrer par date" arrow>
                  <DateRange sx={{ color: "white" }} />
                </Tooltip>
                <TextField
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  label="De"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{
                    width: 150,
                    "& .MuiInputBase-root": {
                      borderRadius: 50,
                      background: "rgba(255,255,255,0.15)",
                    },
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  label="À"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{
                    width: 150,
                    "& .MuiInputBase-root": {
                      borderRadius: 50,
                      background: "rgba(255,255,255,0.15)",
                    },
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
              </Box>

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

              <PremiumButton
                startIcon={<Add />}
                onClick={handleAddFournisseur}
                sx={{
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Nouveau Fournisseur
              </PremiumButton>
            </Box>
          </Box>

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
                    Photo
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Nom
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Téléphone
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Adresse
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
                      {[...Array(7)].map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton
                            animation="wave"
                            height={40}
                            className="premium-skeleton"
                          />
                        </TableCell>
                      ))}
                    </PremiumTableRow>
                  ))
                ) : filteredFournisseurs.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Business
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
                          Aucun fournisseur trouvé
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Essayez d'ajouter un nouveau fournisseur
                        </Typography>
                        <PremiumButton
                          onClick={handleAddFournisseur}
                          startIcon={<Add />}
                        >
                          Ajouter un fournisseur
                        </PremiumButton>
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredFournisseurs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((fournisseur) => (
                      <Slide
                        key={fournisseur.id}
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
                          <TableCell>
                            <Avatar
                              src={fournisseur.image}
                              sx={{
                                width: 56,
                                height: 56,
                                border: "2px solid #667eea",
                                boxShadow:
                                  "0 4px 12px rgba(102, 126, 234, 0.2)",
                              }}
                            >
                              {fournisseur.nom?.charAt(0)}
                            </Avatar>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "#3a4b6d",
                            }}
                          >
                            <Typography fontWeight={600}>
                              {fournisseur.nom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fournisseur.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fournisseur.telephone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fournisseur.adresse}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fournisseur.date_ajout}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Modifier" arrow>
                                <IconButton
                                  onClick={() => handleEdit(fournisseur)}
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
                              <Tooltip title="Supprimer" arrow>
                                <IconButton
                                  onClick={() => handleDelete(fournisseur.id)}
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
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    ))
                )}

                {!loading && emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredFournisseurs.length}
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

        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "block", sm: "none" },
            zIndex: 1000,
          }}
        >
          <Tooltip title="Ajouter un fournisseur" arrow>
            <Button
              variant="contained"
              onClick={handleAddFournisseur}
              sx={{
                borderRadius: "50%",
                width: 60,
                height: 60,
                minWidth: 0,
                boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

        <FournisseurForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshFournisseurs={fetchFournisseurs}
          fournisseurToEdit={fournisseurToEdit}
        />
      </Box>
    </Fade>
  );
};

export default FournisseurList;
