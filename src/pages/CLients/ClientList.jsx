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
  Person,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import ClientForm from "./ClientForm";
import Swal from "sweetalert2";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../Api2/clientAPI";

// Composants stylisés premium
const PremiumTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    background:
      "linear-gradient(90deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)",
  },
  "&:hover": {
    background:
      "linear-gradient(90deg, rgba(225,245,255,1) 0%, rgba(255,255,255,1) 100%)",
    transform: "scale(1.01)",
    boxShadow: theme.shadows[3],
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

const PremiumIconButton = styled(IconButton)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.3)",
    backgroundColor: "transparent",
  },
}));

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const { data } = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error("Erreur de chargement :", error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de charger les clients",
        icon: "error",
        background: "#fff",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Confirmer la suppression",
      html: `<div style="font-size: 16px;">Voulez-vous vraiment supprimer ce client? <br/><small>Cette action est irréversible.</small></div>`,
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
    });

    if (confirm.isConfirmed) {
      try {
        await deleteClient(id);
        await loadClients();
        Swal.fire({
          title: "Supprimé!",
          text: "Le client a été supprimé avec succès.",
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
  };

  const handleAddClient = () => {
    setEditClient(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadClients();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFormSubmit = async (clientData) => {
    try {
      if (editClient) {
        await updateClient(editClient.id, clientData);
        Swal.fire({
          title: "Succès!",
          text: "Client modifié avec succès",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      } else {
        await createClient(clientData);
        Swal.fire({
          title: "Succès!",
          text: "Client créé avec succès",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }
      await loadClients();
      setOpenForm(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
  };

  const filteredClients = clients.filter((client) =>
    Object.values(client).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredClients.length - page * rowsPerPage);

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
              <Person sx={{ fontSize: 40 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Gestion des Clients
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
                onClick={handleAddClient}
                sx={{
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Nouveau Client
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
                    Photo
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Client
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
       {      /*     <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Statut
                  </TableCell>*/}
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
                      {[...Array(6)].map((_, cellIndex) => (
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
                ) : filteredClients.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Person
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
                          Aucun client trouvé
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Essayez d'ajouter un nouveau client
                        </Typography>
                        <PremiumButton
                          onClick={handleAddClient}
                          startIcon={<Add />}
                        >
                          Ajouter un client
                        </PremiumButton>
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredClients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <Slide
                        key={client.id}
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
                              src={client.image}
                              sx={{
                                width: 56,
                                height: 56,
                                border: "2px solid #667eea",
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                              }}
                            >
                              {client.name?.charAt(0) || "C"}
                            </Avatar>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "#3a4b6d",
                            }}
                          >
                            <Typography
                              fontWeight={600}
                              sx={{ color: "#3a4b6d" }}
                            >
                              {client.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {client.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {client.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {client.address}
                            </Typography>
                          </TableCell>
                 {/*         <TableCell>
                            <Chip
                              label={
                                client.status === "active" ? "Actif" : "Inactif"
                              }
                              color={
                                client.status === "active"
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                              sx={{
                                borderRadius: 1,
                                fontWeight: 600,
                                textTransform: "capitalize",
                                minWidth: 80,
                                justifyContent: "center",
                              }}
                            />
                          </TableCell>
*/}                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Tooltip title="Modifier" arrow>
                                <PremiumIconButton
                                  onClick={() => {
                                    setEditClient(client);
                                    setOpenForm(true);
                                  }}
                                  sx={{
                                    color: "#3a4b6d",
                                    "&:hover": {
                                      color: "#667eea",
                                      transform: "scale(1.2)",
                                    },
                                  }}
                                >
                                  <Edit />
                                </PremiumIconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer" arrow>
                                <PremiumIconButton
                                  onClick={() => handleDelete(client.id)}
                                  sx={{
                                    color: "#ff4444",
                                    "&:hover": {
                                      transform: "scale(1.2)",
                                    },
                                  }}
                                >
                                  <Delete />
                                </PremiumIconButton>
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

          {/* Pagination premium */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredClients.length}
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
          <Tooltip title="Ajouter un client" arrow>
            <Button
              variant="contained"
              onClick={handleAddClient}
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
        <ClientForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
          clientToEdit={editClient}
        />
      </Box>
    </Fade>
  );
};

export default ClientList;