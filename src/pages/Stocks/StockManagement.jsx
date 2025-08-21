import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  TextField,    
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  Warning,
  CheckCircle,
  Info,
  Close,
  ExpandMore,
  Receipt,
  ShoppingCart,
  Add,
  Remove,
  History,
  Assessment,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const STOCK_API_URL = "http://localhost:5000/api/stock";
const PIECES_API_URL = "http://localhost:5000/api/pieces";

// Composant stylisé pour les cartes de statistiques
const StatCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  color: "white",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

// Hook personnalisé pour la gestion du stock
const useStockManagement = () => {
  const [movements, setMovements] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [movementsRes, levelsRes] = await Promise.all([
        axios.get(`${STOCK_API_URL}/movements`, { headers }),
        axios.get(`${STOCK_API_URL}/levels`, { headers }),
      ]);

      setMovements(movementsRes.data || []);
      setStockLevels(levelsRes.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement du stock:", err);
      setError("Impossible de charger les données de stock");
    } finally {
      setLoading(false);
    }
  };

  const createStockMovement = async (movementData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${STOCK_API_URL}/movement`, movementData, { headers });
      await fetchStockData(); // Recharger les données
      return { success: true };
    } catch (err) {
      console.error("Erreur création mouvement:", err);
      return {
        success: false,
        error: err.response?.data?.message || "Erreur lors de la création du mouvement"
      };
    }
  };

  const checkStock = async (pieceId, requestedQuantity) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${STOCK_API_URL}/check/${pieceId}`, {
        headers,
        params: { requested_quantity: requestedQuantity }
      });

      return response.data;
    } catch (err) {
      console.error("Erreur vérification stock:", err);
      return {
        available: false,
        current_stock: 0,
        message: "Erreur de vérification"
      };
    }
  };

  return {
    movements,
    stockLevels,
    loading,
    error,
    fetchStockData,
    createStockMovement,
    checkStock
  };
};

// Composant principal de gestion du stock
const StockManagement = ({ open, onClose, pieceId = null }) => {
  const {
    movements,
    stockLevels,
    loading,
    error,
    fetchStockData,
    createStockMovement,
    checkStock
  } = useStockManagement();

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [pieces, setPieces] = useState([]);

  // Charger les données au montage
  useEffect(() => {
    if (open) {
      fetchStockData();
      loadPieces();
    }
  }, [open]);

  // Charger la liste des pièces
  const loadPieces = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(PIECES_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPieces(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Erreur chargement pièces:", err);
    }
  };

  // Calculer les statistiques
  const stockStats = React.useMemo(() => {
    const totalPieces = stockLevels.length;
    const outOfStock = stockLevels.filter(item => item.current_stock <= 0).length;
    const lowStock = stockLevels.filter(item => 
      item.current_stock > 0 && item.current_stock <= (item.minimum_stock || 5)
    ).length;
    const totalValue = stockLevels.reduce((sum, item) => 
      sum + (item.current_stock * (item.unit_price || 0)), 0
    );

    return {
      totalPieces,
      outOfStock,
      lowStock,
      totalValue,
      healthyStock: totalPieces - outOfStock - lowStock
    };
  }, [stockLevels]);

  // Filtrer les mouvements par pièce si spécifié
  const filteredMovements = pieceId 
    ? movements.filter(m => m.piece_id === pieceId)
    : movements;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{ sx: { minHeight: '90vh', borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Inventory sx={{ fontSize: 32 }} />
          <Typography variant="h5">
            Gestion du Stock
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 3 }}>
              Chargement des données de stock...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Cartes de statistiques */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 1 }} />
                Vue d'ensemble du stock
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="#3498db">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {stockStats.totalPieces}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Articles totaux
                          </Typography>
                        </Box>
                        <Inventory sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="#e74c3c">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {stockStats.outOfStock}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            En rupture
                          </Typography>
                        </Box>
                        <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="#f39c12">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {stockStats.lowStock}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Stock faible
                          </Typography>
                        </Box>
                        <TrendingDown sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="#27ae60">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {stockStats.totalValue.toFixed(0)}€
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Valeur totale
                          </Typography>
                        </Box>
                        <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </StatCard>
                </Grid>
              </Grid>
            </Grid>

            {/* Accordéons pour les différentes sections */}
            <Grid item xs={12}>
              {/* Niveaux de stock actuels */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Niveaux de stock actuels
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pièce</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Référence</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stock actuel</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stock minimum</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Valeur</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stockLevels.map((item, index) => {
                          const isOutOfStock = item.current_stock <= 0;
                          const isLowStock = item.current_stock > 0 && 
                            item.current_stock <= (item.minimum_stock || 5);
                          
                          return (
                            <TableRow 
                              key={item.piece_id || index}
                              sx={{
                                bgcolor: isOutOfStock ? 'error.light' : 
                                         isLowStock ? 'warning.light' : 
                                         'inherit',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <TableCell fontWeight={600}>
                                {item.piece_name || `Pièce #${item.piece_id}`}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={item.reference || 'N/A'} 
                                  variant="outlined" 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="h6" color={
                                  isOutOfStock ? 'error.main' : 
                                  isLowStock ? 'warning.main' : 
                                  'success.main'
                                }>
                                  {item.current_stock}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {item.minimum_stock || 5}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={
                                    isOutOfStock ? <Warning /> : 
                                    isLowStock ? <Warning /> : 
                                    <CheckCircle />
                                  }
                                  label={
                                    isOutOfStock ? 'Rupture' : 
                                    isLowStock ? 'Stock faible' : 
                                    'Disponible'
                                  }
                                  color={
                                    isOutOfStock ? 'error' : 
                                    isLowStock ? 'warning' : 
                                    'success'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary">
                                  {((item.current_stock || 0) * (item.unit_price || 0)).toFixed(2)}€
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* Historique des mouvements */}
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Historique des mouvements
                    <Chip 
                      label={`${filteredMovements.length} mouvements`} 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Pièce</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Quantité</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Raison</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Référence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMovements.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                Aucun mouvement de stock enregistré
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredMovements.map((movement, index) => (
                            <TableRow key={movement.id || index}>
                              <TableCell>
                                {new Date(movement.created_at || movement.date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography fontWeight={500}>
                                    {movement.piece_name || `Pièce #${movement.piece_id}`}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={movement.type === 'entree' ? <Add /> : <Remove />}
                                  label={movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                                  color={movement.type === 'entree' ? 'success' : 'error'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  color={movement.type === 'entree' ? 'success.main' : 'error.main'}
                                  fontWeight={600}
                                >
                                  {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {movement.reason || 'Non spécifié'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {movement.reference_type && movement.reference_id && (
                                  <Chip
                                    icon={movement.reference_type === 'vente' ? <ShoppingCart /> : <Receipt />}
                                    label={`${movement.reference_type} #${movement.reference_id}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* Alertes et recommandations */}
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Alertes et recommandations
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {stockStats.outOfStock > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${stockStats.outOfStock} article(s) en rupture de stock`}
                          secondary="Action requise: Réapprovisionnement urgent"
                        />
                      </ListItem>
                    )}
                    
                    {stockStats.lowStock > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Info color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${stockStats.lowStock} article(s) avec un stock faible`}
                          secondary="Recommandation: Planifier le réapprovisionnement"
                        />
                      </ListItem>
                    )}

                    {stockStats.healthyStock > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${stockStats.healthyStock} article(s) avec un stock sain`}
                          secondary="Niveau de stock optimal maintenu"
                        />
                      </ListItem>
                    )}

                    {stockStats.totalPieces === 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Info color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Aucun article en stock"
                          secondary="Commencez par ajouter des pièces à votre inventaire"
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Fermer
        </Button>
        <Button 
          onClick={fetchStockData} 
          variant="contained" 
          startIcon={<History />}
          disabled={loading}
        >
          Actualiser
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockManagement;