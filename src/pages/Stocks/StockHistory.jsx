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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import {
  History,
  ArrowUpward,
  ArrowDownward,
  Close,
  Search,
  FilterAlt,
  Refresh,
  FileDownload,
  BarChart,
  Timeline,
  Sort,
} from "@mui/icons-material";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "@mui/material/styles";

const StockHistory = ({
  open,
  onClose,
  history,
  stockId,
  stockName,
  loading = false,
  onRefresh,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const [timeRange, setTimeRange] = React.useState("all");
  const [sortConfig, setSortConfig] = React.useState({
    key: "created_at",
    direction: "desc",
  });

  const filteredHistory = React.useMemo(() => {
    let filtered = [...history];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.user_id?.toLowerCase().includes(term) ||
          record.reason?.toLowerCase().includes(term) ||
          record.change.toString().includes(term)
      );
    }

    // Filtre par période
    if (timeRange !== "all") {
      const days = timeRange === "7d" ? 7 : 30;
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(
        (record) => new Date(record.created_at) >= cutoffDate
      );
    }

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [history, searchTerm, timeRange, sortConfig]);

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    // Implémentez l'export CSV ici
    console.log("Exporting data...", filteredHistory);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowUpward /> : <ArrowDownward />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
        },
      }}
    >
      <DialogTitle>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <History color="primary" />
            <Box>
              <Typography variant="h6">Historique des mouvements</Typography>
              <Typography variant="body2" color="textSecondary">
                {stockName} (ID: {stockId})
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={onRefresh} disabled={loading}>
                <Refresh color={loading ? "disabled" : "primary"} />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between" gap={2}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <Tabs
            value={timeRange}
            onChange={(e, newValue) => setTimeRange(newValue)}
            sx={{ minHeight: "auto" }}
          >
            <Tab
              label="7 jours"
              value="7d"
              sx={{ minHeight: "auto", py: 0.5, px: 1 }}
            />
            <Tab
              label="30 jours"
              value="30d"
              sx={{ minHeight: "auto", py: 0.5, px: 1 }}
            />
            <Tab
              label="Tout"
              value="all"
              sx={{ minHeight: "auto", py: 0.5, px: 1 }}
            />
          </Tabs>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : filteredHistory.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Aucun historique disponible
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "100%" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      onClick={() => handleSort("created_at")}
                      sx={{ cursor: "pointer" }}
                    >
                      Date
                      {getSortIcon("created_at")}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      onClick={() => handleSort("user_id")}
                      sx={{ cursor: "pointer" }}
                    >
                      Utilisateur
                      {getSortIcon("user_id")}
                    </Box>
                  </TableCell>
                  <TableCell>Mouvement</TableCell>
                  <TableCell align="right">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      onClick={() => handleSort("change")}
                      sx={{ cursor: "pointer" }}
                    >
                      Quantité
                      {getSortIcon("change")}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      onClick={() => handleSort("new_quantity")}
                      sx={{ cursor: "pointer" }}
                    >
                      Nouvelle quantité
                      {getSortIcon("new_quantity")}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      onClick={() => handleSort("reason")}
                      sx={{ cursor: "pointer" }}
                    >
                      Raison
                      {getSortIcon("reason")}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{
                      backgroundColor:
                        record.change > 0
                          ? theme.palette.success.light + "20"
                          : theme.palette.error.light + "20",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(record.created_at), "PP", {
                          locale: fr,
                        })}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(record.created_at), "p", {
                          locale: fr,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 14,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {record.user_id?.charAt(0).toUpperCase() || "S"}
                        </Avatar>
                        <Typography variant="body2">
                          {record.user_id || "Système"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.change > 0 ? (
                        <Chip
                          icon={<ArrowUpward fontSize="small" />}
                          label="Entrée"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<ArrowDownward fontSize="small" />}
                          label="Sortie"
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight="bold"
                        color={record.change > 0 ? "success.main" : "error.main"}
                      >
                        {record.change > 0 ? `+${record.change}` : record.change}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {record.new_quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={record.reason || "Aucune raison spécifiée"}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {record.reason || "-"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {filteredHistory.length} résultat{filteredHistory.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Exporter en CSV">
            <Button
              startIcon={<FileDownload />}
              onClick={handleExport}
              variant="outlined"
              size="small"
            >
              Exporter
            </Button>
          </Tooltip>
          <Button
            onClick={onClose}
            color="primary"
            variant="contained"
            size="small"
          >
            Fermer
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default StockHistory;