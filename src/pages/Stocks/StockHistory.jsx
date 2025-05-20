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
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
} from "@mui/lab";
import {
  Inventory,
  Person,
  Edit,
  Add,
  Remove,
  Delete,
  History,
} from "@mui/icons-material";

const StockHistory = ({ open, onClose, history }) => {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "create":
        return <Add color="success" />;
      case "update":
        return <Edit color="info" />;
      case "delete":
        return <Delete color="error" />;
      case "increment":
        return <Add color="success" />;
      case "decrement":
        return <Remove color="error" />;
      default:
        return <History color="action" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "error";
      case "increment":
        return "success";
      case "decrement":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Inventory />
        <Typography variant="h6">Historique des mouvements de stock</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {history.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              Aucun historique disponible
            </Typography>
          </Box>
        ) : (
          <Timeline position="alternate">
            {history.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={getActionColor(item.action)}>
                    {getActionIcon(item.action)}
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.action === "create" && "Création du stock"}
                          {item.action === "update" && "Mise à jour du stock"}
                          {item.action === "delete" && "Suppression du stock"}
                          {item.action === "increment" &&
                            "Augmentation du stock"}
                          {item.action === "decrement" && "Diminution du stock"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.date).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: "primary.main",
                          }}
                        >
                          <Person sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">{item.user}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                      {item.oldQuantity !== undefined && (
                        <Chip
                          label={`Ancien: ${item.oldQuantity}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {item.newQuantity !== undefined && (
                        <Chip
                          label={`Nouveau: ${item.newQuantity}`}
                          size="small"
                          color={getActionColor(item.action)}
                        />
                      )}
                      {item.change !== undefined && (
                        <Chip
                          label={`Modification: ${item.change > 0 ? "+" : ""}${
                            item.change
                          }`}
                          size="small"
                          color={getActionColor(item.action)}
                        />
                      )}
                    </Box>

                    {item.reason && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontStyle: "italic" }}
                      >
                        Raison: {item.reason}
                      </Typography>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
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
