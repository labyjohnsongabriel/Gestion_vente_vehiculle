import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Equalizer,
  Close,
  Refresh,
  FileDownload,
  FilterAlt,
  Timeline,
  BarChart,
  ShowChart,
  DateRange,
  Warning,
  Inventory,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const StockTrends = ({
  open,
  onClose,
  trends,
  stockId,
  stockName,
  loading = false,
  onRefresh,
  onExport,
}) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [chartType, setChartType] = useState("area");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStat, setActiveStat] = useState("quantity");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filteredData = useMemo(() => {
    if (!trends || trends.length === 0) return [];

    let cutoffDate;
    switch (timeRange) {
      case "24h":
        cutoffDate = dayjs().subtract(1, "day");
        break;
      case "7d":
        cutoffDate = dayjs().subtract(7, "days");
        break;
      case "30d":
        cutoffDate = dayjs().subtract(30, "days");
        break;
      case "90d":
        cutoffDate = dayjs().subtract(90, "days");
        break;
      default:
        return trends;
    }

    return trends.filter((item) => dayjs(item.date).isAfter(cutoffDate));
  }, [trends, timeRange]);

  const chartData = useMemo(() => {
    const categories = filteredData.map((item) => item.date);
    const quantities = filteredData.map((item) => item.quantity);
    const minQuantities = filteredData.map((item) => item.min_quantity);
    const alertThresholds = filteredData.map((item) => item.alert_threshold);

    return {
      categories,
      series: [
        { name: "Quantité actuelle", data: quantities },
        { name: "Quantité minimale", data: minQuantities },
        { name: "Seuil d'alerte", data: alertThresholds },
      ],
    };
  }, [filteredData]);

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const quantities = filteredData.map((item) => item.quantity);
    const changes = [];
    for (let i = 1; i < quantities.length; i++) {
      changes.push(quantities[i] - quantities[i - 1]);
    }

    const currentStock = quantities[quantities.length - 1];
    const minStock = Math.min(...quantities);
    const maxStock = Math.max(...quantities);
    const avgConsumption = changes.length > 0 
      ? Math.abs(changes.reduce((a, b) => a + b, 0) / changes.length) 
      : 0;
    const daysUntilDepletion = avgConsumption > 0 
      ? currentStock / avgConsumption 
      : Infinity;

    const trend = changes.length > 0 
      ? changes.reduce((a, b) => a + b, 0) / changes.length 
      : 0;

    return {
      currentStock,
      minStock,
      maxStock,
      avgConsumption: avgConsumption.toFixed(2),
      daysUntilDepletion: daysUntilDepletion.toFixed(1),
      trend,
      lastChange: changes.length > 0 ? changes[changes.length - 1] : 0,
    };
  }, [filteredData]);

  const recommendation = useMemo(() => {
    if (!stats) return null;

    if (stats.daysUntilDepletion === "Infinity") {
      return {
        severity: "info",
        message: "Pas de consommation enregistrée",
        icon: <Inventory />,
      };
    }

    const days = parseFloat(stats.daysUntilDepletion);
    const trend = stats.trend;

    if (days < 3) {
      return {
        severity: "error",
        message: "Rupture imminente - Commander urgemment",
        icon: <Warning fontSize="large" />,
      };
    } else if (days < 7) {
      return {
        severity: "warning",
        message: "Stock critique - Commander rapidement",
        icon: <Warning fontSize="large" />,
      };
    } else if (days < 14) {
      return trend > 0
        ? {
            severity: "info",
            message: "Stock suffisant - Surveiller la tendance à la hausse",
            icon: <TrendingUp fontSize="large" />,
          }
        : {
            severity: "warning",
            message: "Stock faible - Penser à commander",
            icon: <TrendingDown fontSize="large" />,
          };
    } else {
      return {
        severity: "success",
        message: "Stock suffisant",
        icon: <Inventory fontSize="large" />,
      };
    }
  }, [stats]);

  const chartOptions = {
    chart: {
      type: chartType,
      height: 350,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      toolbar: {
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: [3, 3, 2],
      dashArray: [0, 0, 5],
    },
    colors: ["#4CAF50", "#FF9800", "#F44336"],
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        formatter: (value) => dayjs(value).format("DD MMM HH:mm"),
      },
    },
    yaxis: {
      title: {
        text: "Quantité",
      },
      min: 0,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
      y: {
        formatter: (value) => `${value} unités`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    annotations: {
      yaxis: [
        {
          y: filteredData[0]?.alert_threshold,
          borderColor: "#F44336",
          label: {
            borderColor: "#F44336",
            style: {
              color: "#fff",
              background: "#F44336",
            },
            text: "Seuil d'alerte",
          },
        },
      ],
    },
  };

  if (!trends || trends.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Equalizer color="info" />
              <Typography variant="h6">Tendances du stock</Typography>
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">Aucune donnée de tendance disponible</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Equalizer color="info" />
            <Box>
              <Typography variant="h6">Analyse des tendances</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {stockName} (ID: {stockId})
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Rafraîchir les données">
              <IconButton onClick={onRefresh} disabled={loading}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Refresh color="primary" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter les données">
              <IconButton onClick={() => onExport(filteredData)}>
                <FileDownload color="primary" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Tabs
            value={timeRange}
            onChange={(e, newValue) => setTimeRange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="24h" value="24h" icon={<Timeline />} />
            <Tab label="7 jours" value="7d" icon={<ShowChart />} />
            <Tab label="30 jours" value="30d" icon={<BarChart />} />
            <Tab label="90 jours" value="90d" icon={<DateRange />} />
            <Tab label="Tout" value="all" />
          </Tabs>

          <Box>
            <Button
              startIcon={<FilterAlt />}
              onClick={handleMenuOpen}
              variant="outlined"
              size="small"
            >
              Type de graphique
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { setChartType("area"); handleMenuClose(); }}>
                Aire
              </MenuItem>
              <MenuItem onClick={() => { setChartType("line"); handleMenuClose(); }}>
                Ligne
              </MenuItem>
              <MenuItem onClick={() => { setChartType("bar"); handleMenuClose(); }}>
                Barres
              </MenuItem>
            </Menu>
          </Box>
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
        ) : (
          <>
            <Box height={400}>
              <ReactApexChart
                options={chartOptions}
                series={chartData.series}
                type={chartType}
                height="100%"
              />
            </Box>

            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques clés
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Stock actuel"
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontWeight="bold">
                              {stats?.currentStock}
                            </Typography>
                            <Chip
                              label={`${stats?.lastChange >= 0 ? "+" : ""}${stats?.lastChange}`}
                              size="small"
                              color={stats?.lastChange >= 0 ? "success" : "error"}
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Consommation moyenne/jour"
                        secondary={`${stats?.avgConsumption} unités`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Jours avant rupture"
                        secondary={
                          stats?.daysUntilDepletion === "Infinity"
                            ? "Non calculable"
                            : `${stats?.daysUntilDepletion} jours`
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Variation moyenne"
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {stats?.trend >= 0 ? (
                              <TrendingUp color="success" />
                            ) : (
                              <TrendingDown color="error" />
                            )}
                            <Typography>
                              {Math.abs(stats?.trend).toFixed(2)} unités/jour
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Analyse de stock
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Stock minimum enregistré"
                        secondary={`${stats?.minStock} unités`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Stock maximum enregistré"
                        secondary={`${stats?.maxStock} unités`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Période analysée"
                        secondary={`${filteredData.length} points de données`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Dernière mise à jour"
                        secondary={dayjs(filteredData[filteredData.length - 1]?.date).format(
                          "DD MMM YYYY à HH:mm"
                        )}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Recommandation
                  </Typography>
                  {recommendation && (
                    <Box
                      flexGrow={1}
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      textAlign="center"
                      p={2}
                    >
                      <Box fontSize="3rem" mb={2}>
                        {recommendation.icon}
                      </Box>
                      <Alert
                        severity={recommendation.severity}
                        sx={{ width: "100%" }}
                      >
                        <Typography fontWeight="bold">
                          {recommendation.message}
                        </Typography>
                        {stats?.daysUntilDepletion !== "Infinity" && (
                          <Typography variant="body2">
                            Stock prévu pour {stats?.daysUntilDepletion} jours
                          </Typography>
                        )}
                      </Alert>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockTrends;