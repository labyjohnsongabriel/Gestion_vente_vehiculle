import React, { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Refresh,
  DirectionsCar,
  CalendarToday,
  Speed,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import VehiculeForm from "./VehiculeForm";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Ajout de import useNavigate

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

const API_URL = "http://localhost:5000/api/vehicules";

const VehiculeList = () => {
  const [vehicules, setVehicules] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [vehiculeToEdit, setVehiculeToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate(); // Ajout de useNavigate

  // Création d'une instance axios avec token d'authentification
  const axiosWithAuth = axios.create();

  useEffect(() => {
    const requestInterceptor = axiosWithAuth.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    const responseInterceptor = axiosWithAuth.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosWithAuth.interceptors.request.eject(requestInterceptor);
      axiosWithAuth.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Changé de "/" à "/login" pour être cohérent
    Swal.fire("Session expirée", "Veuillez vous reconnecter", "info");
  };

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setAuthError(false);

      const response = await axiosWithAuth.get(API_URL);
      setVehicules(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setAuthError(true);
          Swal.fire({
            title: "Erreur d'authentification",
            text: "Votre session a expiré ou vous n'êtes pas connecté. Veuillez vous reconnecter.",
            icon: "error",
            confirmButtonText: "Se connecter",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/login"); // Utilisez navigate au lieu de window.location
            }
          });
        } else if (error.response.status === 403) {
          Swal.fire({
            title: "Permission refusée",
            text: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
            icon: "warning",
          });
        } else {
          Swal.fire("Erreur", "Impossible de charger les véhicules", "error");
        }
      } else if (error.request) {
        Swal.fire(
          "Erreur réseau",
          "Impossible de se connecter au serveur",
          "error"
        );
      } else {
        Swal.fire("Erreur", "Une erreur inattendue est survenue", "error");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        await fetchVehicules();
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Fetch error:", error);
        }
      }
    };

    fetchData();

    return () => {
      source.cancel("Component unmounted");
    };
  }, []);

  const handleEdit = (vehicule) => {
    setVehiculeToEdit(vehicule);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer ce véhicule? <br/><small>Cette action est irréversible.</small></div>`,
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
          fetchVehicules();
          Swal.fire(
            "Supprimé!",
            "Le véhicule a été supprimé avec succès.",
            "success"
          );
        } catch (error) {
          if (error.response?.status === 401) {
            Swal.fire(
              "Erreur d'authentification",
              "Veuillez vous reconnecter",
              "error"
            );
          } else {
            Swal.fire("Erreur", "La suppression a échoué.", "error");
          }
        }
      }
    });
  };

  const handleAddVehicule = () => {
    setVehiculeToEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchVehicules();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredVehicules = useMemo(() => {
    return vehicules.filter((veh) =>
      ["marque", "modele", "immatriculation", "type", "statut"].some(
        (field) =>
          veh[field] &&
          veh[field].toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [vehicules, searchTerm]);

  const paginatedVehicules = useMemo(() => {
    return filteredVehicules.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredVehicules, page, rowsPerPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  };

  if (authError) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: "auto" }}>
          <DirectionsCar sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Erreur d'authentification
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Vous devez être connecté pour accéder à la gestion des véhicules.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")} // Utiliser navigate au lieu de manipuler directement window.location
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
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            background: "linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)",
          }}
        >
          {/* Header */}
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
              <DirectionsCar sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Gestion des Véhicules
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
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                }}
              />

              <Tooltip title="Actualiser" arrow>
                <IconButton onClick={handleRefresh} sx={{ color: "white" }}>
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
                onClick={handleAddVehicule}
                sx={{
                  display: { xs: "none", sm: "flex" },
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                Nouveau Véhicule
              </Button>
            </Box>
          </Box>

          {/* Tableau */}
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
                    Marque
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Modèle
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Immatriculation
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Année
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Kilométrage
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Date d'ajout
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
                ) : filteredVehicules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <DirectionsCar
                          sx={{
                            fontSize: 60,
                            color: "text.disabled",
                            mb: 1,
                          }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          Aucun véhicule trouvé
                        </Typography>
                        <Button
                          onClick={handleAddVehicule}
                          startIcon={<Add />}
                          sx={{ mt: 2 }}
                        >
                          Ajouter un véhicule
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVehicules.map((vehicule) => (
                    <PremiumTableRow key={vehicule.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar sx={{ bgcolor: "#667eea", color: "white" }}>
                            {vehicule.marque?.charAt(0) || "V"}
                          </Avatar>
                          <Typography fontWeight={600}>
                            {vehicule.marque}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{vehicule.modele}</TableCell>
                      <TableCell>
                        <Chip
                          label={vehicule.immatriculation}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{vehicule.annee}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Speed color="action" />
                          {vehicule.kilometrage} km
                        </Box>
                      </TableCell>
                      <TableCell>{vehicule.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={vehicule.statut}
                          color={
                            vehicule.statut === "disponible"
                              ? "success"
                              : vehicule.statut === "en maintenance"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                          sx={{
                            fontWeight: 600,
                            minWidth: 120,
                          }}
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
                          <CalendarToday color="action" fontSize="small" />
                          {formatDate(vehicule.date_ajout)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier" arrow>
                          <IconButton onClick={() => handleEdit(vehicule)}>
                            <Edit color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer" arrow>
                          <IconButton onClick={() => handleDelete(vehicule.id)}>
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
            count={filteredVehicules.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          />
        </Paper>

        {/* Bouton mobile */}
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "block", sm: "none" },
          }}
        >
          <Tooltip title="Ajouter un véhicule" arrow>
            <Button
              variant="contained"
              onClick={handleAddVehicule}
              sx={{
                borderRadius: "50%",
                width: 60,
                height: 60,
                minWidth: 0,
                boxShadow: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Add />
            </Button>
          </Tooltip>
        </Box>

        <VehiculeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshVehicules={fetchVehicules}
          vehiculeToEdit={vehiculeToEdit}
          axiosInstance={axiosWithAuth}
        />
      </Box>
    </Fade>
  );
};

export default VehiculeList;
