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
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Refresh,
  Inventory,
  FilterList,
  Warning,
  Notifications,
  History,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import StockForm from "./StockForm";
import StockHistory from "./StockHistory";
import axios from "axios";
import { useAuth } from "../../components/context/AuthContext";

const API_URL = "http://localhost:5000/api/stocks";

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

const StockList = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [currentAdjustment, setCurrentAdjustment] = useState({
    stockId: null,
    change: 0,
    reason: "",
    currentQuantity: 0,
  });

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axios.get(API_URL);

      const stocksData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const validatedStocks = stocksData.map((stock, idx) => ({
        id: stock.id || `temp-${idx}-${Date.now()}`,
        piece_id: stock.piece_id || "",
        piece_name: stock.piece_name || stock.piece?.name || "Pièce sans nom",
        quantity: Number(stock.quantity) || 0,
        min_quantity: Number(stock.min_quantity) || 5,
        last_updated: stock.last_updated || new Date().toISOString(),
      }));

      setStocks(validatedStocks);
    } catch (error) {
      console.error("Erreur lors du chargement des stocks:", error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de charger les stocks",
        icon: "error",
      });
      setStocks([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStockHistory = async (stockId) => {
    try {
      const response = await axios.get(`${API_URL}/${stockId}/history`);
      setStockHistory(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setStockHistory([]);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de charger l'historique",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleAdjustClick = (stockId, initialChange = 0, currentQuantity) => {
    setCurrentAdjustment({
      stockId,
      change: initialChange,
      reason: "",
      currentQuantity,
    });
    setAdjustmentDialogOpen(true);
  };

  const confirmAdjustment = async () => {
    try {
      await axios.patch(`${API_URL}/${currentAdjustment.stockId}/adjust`, {
        adjustment: currentAdjustment.change,
        reason: currentAdjustment.reason,
      });
      await fetchStocks();
      setAdjustmentDialogOpen(false);
      Swal.fire({
        title: "Succès",
        text: "Stock ajusté avec succès",
        icon: "success",
        timer: 1500,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajustement du stock:", error);
      Swal.fire({
        title: "Erreur",
        text: "Échec de l'ajustement du stock",
        icon: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirmer la suppression",
      text: "Voulez-vous vraiment supprimer ce stock?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4444",
      cancelButtonColor: "#9e9e9e",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        await fetchStocks();
        Swal.fire({
          title: "Supprimé!",
          text: "Le stock a été supprimé.",
          icon: "success",
          timer: 1500,
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          title: "Erreur",
          text: "La suppression a échoué",
          icon: "error",
        });
      }
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    if (!stock) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      stock.piece_name?.toLowerCase().includes(searchLower) ||
      stock.quantity.toString().includes(searchTerm) ||
      stock.id?.toLowerCase().includes(searchLower);

    const matchesViewMode =
      viewMode === "all" ||
      (viewMode === "low" && stock.quantity <= stock.min_quantity) ||
      (viewMode === "out" && stock.quantity <= 0);

    return matchesSearch && matchesViewMode;
  });

  const lowStockCount = stocks.filter(
    (s) => s.quantity <= s.min_quantity && s.quantity > 0
  ).length;
  const outOfStockCount = stocks.filter((s) => s.quantity <= 0).length;

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 3 }}>
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
              <Inventory sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Gestion des Stocks
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    "& input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                }}
              />

              <Tooltip title="Filtrer">
                <IconButton
                  sx={{ color: "white" }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>

              <Tooltip title="Actualiser">
                <IconButton
                  sx={{ color: "white" }}
                  onClick={fetchStocks}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>

              {user?.role === "professionnel" && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setStockToEdit(null);
                    setOpenForm(true);
                  }}
                  sx={{
                    background:
                      "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                    color: "white",
                    borderRadius: "50px",
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Nouveau Stock
                </Button>
              )}
            </Box>
          </Box>

          {/* Filtre Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setViewMode("all");
                setAnchorEl(null);
              }}
            >
              Tous les stocks
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewMode("low");
                setAnchorEl(null);
              }}
            >
              <Badge
                badgeContent={lowStockCount}
                color="warning"
                sx={{ mr: 2 }}
              >
                Stock faible
              </Badge>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewMode("out");
                setAnchorEl(null);
              }}
            >
              <Badge
                badgeContent={outOfStockCount}
                color="error"
                sx={{ mr: 2 }}
              >
                Rupture de stock
              </Badge>
            </MenuItem>
          </Menu>

          {/* Tabs */}
          <Tabs
            value={viewMode}
            onChange={(e, newValue) => setViewMode(newValue)}
            sx={{ px: 2, pt: 2 }}
          >
            <Tab label="Tous" value="all" />
            <Tab
              label={
                <Badge badgeContent={lowStockCount} color="warning">
                  Stock faible
                </Badge>
              }
              value="low"
            />
            <Tab
              label={
                <Badge badgeContent={outOfStockCount} color="error">
                  Rupture
                </Badge>
              }
              value="out"
            />
          </Tabs>

          {/* Table */}
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
                    Pièce
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Quantité
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600 }}>
                    Statut
                  </TableCell>
                  {user?.role === "professionnel" && (
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, idx) => (
                    <PremiumTableRow key={`skeleton-${idx}`}>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" />
                      </TableCell>
                      {user?.role === "professionnel" && (
                        <TableCell>
                          <Skeleton animation="wave" />
                        </TableCell>
                      )}
                    </PremiumTableRow>
                  ))
                ) : filteredStocks.length === 0 ? (
                  <PremiumTableRow>
                    <TableCell
                      colSpan={user?.role === "professionnel" ? 4 : 3}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Inventory
                          sx={{ fontSize: 60, color: "text.disabled", mb: 1 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          Aucun stock trouvé
                        </Typography>
                      </Box>
                    </TableCell>
                  </PremiumTableRow>
                ) : (
                  filteredStocks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((stock) => (
                      <PremiumTableRow key={stock.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "#3a4b6d", color: "white" }}>
                              {stock.piece_name?.charAt(0)?.toUpperCase() ||
                                "P"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {stock.piece_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {stock.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            fontWeight={600}
                            color={
                              stock.quantity <= 0
                                ? "error.main"
                                : stock.quantity <= stock.min_quantity
                                ? "warning.main"
                                : "primary.main"
                            }
                          >
                            {stock.quantity}
                            {stock.min_quantity > 0 && (
                              <Typography
                                component="span"
                                variant="caption"
                                ml={1}
                                color="text.secondary"
                              >
                                (min: {stock.min_quantity})
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              stock.quantity <= 0
                                ? "Épuisé"
                                : stock.quantity <= stock.min_quantity
                                ? "Stock faible"
                                : "Disponible"
                            }
                            color={
                              stock.quantity <= 0
                                ? "error"
                                : stock.quantity <= stock.min_quantity
                                ? "warning"
                                : "success"
                            }
                            icon={
                              stock.quantity <= stock.min_quantity ? (
                                <Warning fontSize="small" />
                              ) : null
                            }
                          />
                        </TableCell>
                        {user?.role === "professionnel" && (
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Historique">
                                <IconButton
                                  onClick={async () => {
                                    setSelectedStockId(stock.id);
                                    await fetchStockHistory(stock.id);
                                    setOpenHistory(true);
                                  }}
                                  size="small"
                                >
                                  <History fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Augmenter stock">
                                <IconButton
                                  onClick={() =>
                                    handleAdjustClick(
                                      stock.id,
                                      1,
                                      stock.quantity
                                    )
                                  }
                                  size="small"
                                  color="success"
                                >
                                  <ArrowUpward fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Diminuer stock">
                                <IconButton
                                  onClick={() =>
                                    handleAdjustClick(
                                      stock.id,
                                      -1,
                                      stock.quantity
                                    )
                                  }
                                  size="small"
                                  color="error"
                                  disabled={stock.quantity <= 0}
                                >
                                  <ArrowDownward fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => {
                                    setStockToEdit(stock);
                                    setOpenForm(true);
                                  }}
                                  size="small"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDelete(stock.id)}
                                  size="small"
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </PremiumTableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStocks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Bouton mobile pour ajout */}
        {user?.role === "professionnel" && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              display: { xs: "block", sm: "none" },
            }}
          >
            <Tooltip title="Ajouter un stock">
              <Button
                variant="contained"
                onClick={() => {
                  setStockToEdit(null);
                  setOpenForm(true);
                }}
                sx={{
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  minWidth: 0,
                  background:
                    "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                }}
              >
                <Add />
              </Button>
            </Tooltip>
          </Box>
        )}

        {/* Dialogue d'ajustement */}
        <Dialog
          open={adjustmentDialogOpen}
          onClose={() => setAdjustmentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentAdjustment.change > 0
              ? "Augmenter le stock"
              : "Diminuer le stock"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Quantité actuelle: {currentAdjustment.currentQuantity}
              <br />
              Nouvelle quantité:{" "}
              {currentAdjustment.currentQuantity + currentAdjustment.change}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Raison de l'ajustement"
              type="text"
              fullWidth
              variant="standard"
              value={currentAdjustment.reason}
              onChange={(e) =>
                setCurrentAdjustment((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustmentDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmAdjustment}
              color={currentAdjustment.change > 0 ? "success" : "error"}
              variant="contained"
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Formulaire de stock */}
        {openForm && (
          <StockForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            stock={stockToEdit}
            refreshStocks={fetchStocks}
            userRole={user?.role}
          />
        )}

        {/* Historique des mouvements */}
        <StockHistory
          open={openHistory}
          onClose={() => setOpenHistory(false)}
          history={stockHistory}
          stockId={selectedStockId}
        />
      </Box>
    </Fade>
  );
};

export default StockList;
