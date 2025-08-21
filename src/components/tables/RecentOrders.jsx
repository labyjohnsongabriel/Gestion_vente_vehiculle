// RecentOrders.js - Tableau des commandes avec permissions
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../context/AuthContext";

export const RecentOrders = ({ data, canModify }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (data) {
      setOrders(data);
      setLoading(false);
    } else {
      fetchOrders();
    }
  }, [data]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/commandes", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result);
      } else {
        throw new Error("Erreur lors du chargement des commandes");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "processing":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Terminée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "processing":
        return "En cours";
      default:
        return status;
    }
  };

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleEdit = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        await fetch(`/api/orders/${selectedOrder.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        });
        fetchOrders();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID Commande</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Produit</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              {canModify && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    <TableCell>{order.id}</TableCell>
                  </Typography>
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.productName}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(order.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </TableCell>
                {canModify && (
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, order)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log("Voir détails")}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Voir détails
        </MenuItem>
        {canModify && (
          <>
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} />
              Modifier
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Supprimer
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Dialog d'édition */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Modifier la commande #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Statut"
              select
              defaultValue={selectedOrder?.status}
              sx={{ mb: 2 }}
            >
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="processing">En cours</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              placeholder="Ajouter des notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
