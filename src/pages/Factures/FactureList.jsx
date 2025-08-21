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
  Receipt,
  PictureAsPdf,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import FactureForm from "./FactureForm";
import axios from "axios";
import { useAuth } from "../../components/context/AuthContext";

const API_URL = "http://localhost:5000/api/factures";
const AUTH_API_URL = "http://localhost:5000/api/auth/me";

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

const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [factureToEdit, setFactureToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role || "user"; // "admin" ou "user" selon votre logique

  const fetchFactures = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get(API_URL);
      // Correction : toujours un tableau
      let facturesData = [];
      if (Array.isArray(response.data)) {
        facturesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        facturesData = response.data.data;
      } else {
        facturesData = [];
      }
      setFactures(facturesData);
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
      Swal.fire("Erreur", "Impossible de charger les factures", "error");
      setFactures([]); // Toujours un tableau pour éviter l'erreur
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleEdit = (facture) => {
    setFactureToEdit(facture);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer cette facture? <br/><small>Cette action est irréversible.</small></div>`,
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
          fetchFactures();
          Swal.fire({
            title: "Supprimé!",
            text: "La facture a été supprimée avec succès.",
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

  const handleGeneratePDF = async (id) => {
    try {
      setLoading(true);

      // Notification de début de génération
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      toast.fire({
        icon: "info",
        title: "Génération du PDF en cours...",
      });

      // Appel API avec gestion du blob et timeout
      const response = await axios.get(`${API_URL}/${id}/pdf`, {
        responseType: "blob",
        timeout: 30000, // 30 secondes timeout
        headers: {
          Accept: "application/pdf",
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Download progress: ${percentCompleted}%`);
        },
      });

      // Vérification du type de contenu
      const contentType = response.headers["content-type"];
      if (
        !contentType.includes("application/pdf") &&
        !contentType.includes("application/octet-stream")
      ) {
        throw new Error("Le serveur n'a pas retourné un fichier PDF valide");
      }

      // Création du blob et téléchargement
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Récupération du nom de fichier
      let filename = `facture_${id}.pdf`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }
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

      // Création du lien et déclenchement du téléchargement
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Nettoyage
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Notification de succès
      Swal.fire({
        title: "PDF généré!",
        text: "Le PDF de la facture a été téléchargé avec succès.",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#4caf50",
        color: "white",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);

      let errorMessage = "Impossible de générer le PDF";

      if (error.code === "ECONNABORTED") {
        errorMessage = "La requête a expiré. Veuillez réessayer.";
      } else if (error.response) {
        // Erreur de réponse du serveur
        switch (error.response.status) {
          case 404:
            errorMessage = "Facture introuvable";
            break;
          case 500:
            errorMessage = "Erreur serveur lors de la génération du PDF";
            break;
          default:
            errorMessage = `Erreur ${error.response.status}: ${
              error.response.data?.message || "Erreur inconnue"
            }`;
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion.";
      } else if (error.message.includes("PDF valide")) {
        errorMessage = "Le document généré n'est pas un PDF valide";
      }

      Swal.fire({
        title: "Erreur",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#3a4b6d",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacture = () => {
    setFactureToEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFactures();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredFactures = factures.filter((facture) =>
    Object.values(facture).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredFactures.length - page * rowsPerPage);

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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Receipt sx={{ fontSize: 40 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Gestion des Factures
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
                onClick={handleAddFacture}
                sx={{
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Nouvelle Facture
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
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Commande
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Montant
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
                          <Skeleton
                            animation="wave"
                            height={40}
                            className="premium-skeleton"
                          />
                        </TableCell>
                      ))}
                    </PremiumTableRow>
                  ))
                ) : filteredFactures.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Receipt
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
                          Aucune facture trouvée
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Essayez d'ajouter une nouvelle facture
                        </Typography>
                        <PremiumButton
                          onClick={handleAddFacture}
                          startIcon={<Add />}
                        >
                          Créer une facture
                        </PremiumButton>
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredFactures
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((facture) => (
                      <Slide
                        key={facture.id}
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
                                {facture.client_name?.charAt(0)}
                              </Avatar>
                              <Typography fontWeight={600}>
                                {facture.client_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: "#3a4b6d" }}>
                            #{facture.commande_ref}
                          </TableCell>
                          <TableCell sx={{ color: "#3a4b6d" }}>
                            {new Date(
                              facture.date_facture
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {facture.total != null && !isNaN(facture.total)
                              ? Number(facture.total).toFixed(2)
                              : "N/A"}
                          </TableCell>

                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Générer PDF" arrow>
                                <IconButton
                                  onClick={() => handleGeneratePDF(facture.id)}
                                  sx={{
                                    color: "#ff4444",
                                    "&:hover": {
                                      color: "#d32f2f",
                                      transform: "scale(1.2)",
                                    },
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  <PictureAsPdf />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier" arrow>
                                <IconButton
                                  onClick={() => handleEdit(facture)}
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
                                  onClick={() => handleDelete(facture.id)}
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
            count={filteredFactures.length}
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
          <Tooltip title="Ajouter une facture" arrow>
            <Button
              variant="contained"
              onClick={handleAddFacture}
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
        <FactureForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          refreshFactures={fetchFactures}
          factureToEdit={factureToEdit}
        />
      </Box>
    </Fade>
  );
};

export default FactureList;
