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
  Category,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import CategoryForm from "./CategoryForm";
import { useNavigate } from "react-router-dom"; // Ajout de l'import manquant

import axios from "../../api/axios"; // Assurez-vous que le chemin est correct
import "../../styles/Categorie.css";

const API_URL = "http://localhost:5000/api/categories";

// Fonction d'aide pour récupérer le token depuis le localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Configuration d'axios avec les headers d'autorisation
const axiosWithAuth = () => {
  const token = getAuthToken();
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

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
  background: "linear-gradient(90deg, #7c2cb9 0%, #2828b2 100%)",
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

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate(); // Hook pour la navigation

  // Configuration des intercepteurs axios
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login"); // Utilisation de navigate au lieu de window.location
    Swal.fire("Session expirée", "Veuillez vous reconnecter", "info");
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);

      // Utilisation de axiosWithAuth pour une gestion cohérente de l'authentification
      const authAxios = axiosWithAuth();
      const response = await authAxios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);

      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setTokenError(true);
        Swal.fire({
          title: "Erreur d'authentification",
          text: "Votre session a expiré. Veuillez vous reconnecter.",
          icon: "error",
          confirmButtonText: "Se reconnecter",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login"); // Utilisation de navigate au lieu de window.location
          }
        });
      } else {
        Swal.fire("Erreur", "Impossible de charger les catégories", "error");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Vérifier si un token existe au chargement
    const token = getAuthToken();
    if (!token) {
      setTokenError(true);
      Swal.fire({
        title: "Non authentifié",
        text: "Veuillez vous connecter pour accéder à cette ressource",
        icon: "warning",
        confirmButtonText: "Se connecter",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login"); // Utilisation de navigate au lieu de window.location
        }
      });
      return;
    }

    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    const token = getAuthToken();
    if (!token) {
      Swal.fire(
        "Erreur",
        "Vous devez être connecté pour effectuer cette action",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer cette catégorie? <br/><small>Cette action est irréversible.</small></div>`,
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
          const authAxios = axiosWithAuth();
          await authAxios.delete(`${API_URL}/${id}`);
          fetchCategories();
          Swal.fire({
            title: "Supprimé!",
            text: "La catégorie a été supprimée avec succès.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
            timerProgressBar: true,
            background: "#4caf50",
            color: "white",
          });
        } catch (error) {
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            Swal.fire(
              "Erreur d'authentification",
              "Votre session a expiré",
              "error"
            );
            navigate("/login"); // Utilisation de navigate au lieu de window.location
          } else {
            Swal.fire("Erreur", "La suppression a échoué.", "error");
          }
        }
      }
    });
  };

  const handleAddCategory = () => {
    const token = getAuthToken();
    if (!token) {
      Swal.fire(
        "Erreur",
        "Vous devez être connecté pour effectuer cette action",
        "error"
      );
      return;
    }

    setCategoryToEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredCategories.length - page * rowsPerPage);

  // Si erreur d'authentification, afficher un message approprié
  if (tokenError) {
    return (
      <Box sx={{ textAlign: "center", p: 5 }}>
        <Category sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Accès non autorisé
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Vous devez être connecté pour accéder à cette page
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            background: "linear-gradient(90deg, #7c2cb9 0%, #2828b2 100%)",
            color: "white",
            borderRadius: "50px",
            px: 4,
            py: 1.5,
          }}
        >
          Se connecter
        </Button>
      </Box>
    );
  }

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
          {/* Header premium */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 3,
              background: "linear-gradient(90deg, #7c2cb9 0%, #2828b2 100%)",
              color: "white",
              borderBottom: "1px solid rgba(2, 2, 2, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Category sx={{ fontSize: 40 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Gestion des Catégories
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
                alignItems: "center",
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

              <Tooltip title="Filtrer" arrow>
                <IconButton sx={{ color: "white" }}>
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualiser" arrow>
                <span>
                  {/* Utilisation de <span> pour ne pas désactiver l'élément Tooltip */}
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
                </span>
              </Tooltip>

              <PremiumButton
                startIcon={<Add />}
                onClick={handleAddCategory}
                sx={{
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Nouvelle Catégorie
              </PremiumButton>
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
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      backgroundColor: "#3a4b6d",
                    }}
                  >
                    Nom
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      backgroundColor: "#3a4b6d",
                    }}
                  >
                    Description
                  </TableCell>
                  {/*<TableCell
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      backgroundColor: "#3a4b6d",
                    }}
                  >
                    Créé le
                  </TableCell>*/}
                  <TableCell
                    align="right"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      backgroundColor: "#3a4b6d",
                    }}
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
                          <Skeleton
                            animation="wave"
                            height={40}
                            className="premium-skeleton"
                          />
                        </TableCell>
                      ))}
                    </PremiumTableRow>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Category
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
                          Aucune catégorie trouvée
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Essayez d'ajouter une nouvelle catégorie
                        </Typography>
                        <PremiumButton
                          onClick={handleAddCategory}
                          startIcon={<Add />}
                        >
                          Créer une catégorie
                        </PremiumButton>
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredCategories
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((category) => (
                      <Slide
                        key={category.id}
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
                          <TableCell
                            sx={{
                              color: "#3a4b6d",
                            }}
                          >
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
                                {category.name?.charAt(0)}
                              </Avatar>
                              <Typography
                                fontWeight={600}
                                sx={{ color: "#3a4b6d" }}
                              >
                                {category.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "#3a4b6d",
                            }}
                          >
                            <Typography variant="body2">
                              {category.description}
                            </Typography>
                          </TableCell>
{          /*                <TableCell
                            sx={{
                              color: "#3a4b6d",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </Typography>
                          </TableCell>
 */}                         <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Modifier" arrow>
                                <IconButton
                                  onClick={() => handleEdit(category)}
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
                                  onClick={() => handleDelete(category.id)}
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
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination premium */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCategories.length}
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

        {/* Bouton mobile premium */}
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "block", sm: "none" },
            zIndex: 1000,
          }}
        >
          <Tooltip title="Ajouter une catégorie" arrow>
            <Button
              variant="contained"
              onClick={handleAddCategory}
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

        {/* Modal du formulaire */}
        <CategoryForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshCategories={fetchCategories}
          categoryToEdit={categoryToEdit}
        />
      </Box>
    </Fade>
  );
};

export default CategoryList;
