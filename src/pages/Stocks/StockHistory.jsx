import React from "react";
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
  Avatar,
  Chip,
} from "@mui/material";
import { History, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const StockHistory = ({ open, onClose, history, stockId }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <History color="primary" />
          <Typography variant="h6">Historique des mouvements</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Stock ID: {stockId}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {history.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Aucun historique disponible
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Mouvement</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Nouvelle quantité</TableCell>
                  <TableCell>Raison</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.created_at), "PPpp", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {record.user_name?.charAt(0) || "U"}
                        </Avatar>
                        {record.user_role || "System"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.change > 0 ? (
                        <Chip
                          icon={<ArrowUpward fontSize="small" />}
                          label="Entrée"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<ArrowDownward fontSize="small" />}
                          label="Sortie"
                          color="error"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {record.change > 0 ? `+${record.change}` : record.change}
                    </TableCell>
                    <TableCell>{record.new_quantity}</TableCell>
                    <TableCell>{record.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockHistory;
