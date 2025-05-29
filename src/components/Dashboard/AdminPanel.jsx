import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  People as UsersIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as RevenueIcon,
  Assessment as StatsIcon,
  TrendingUp as GrowthIcon,
  Event as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { LineChart, PieChart, BarChart } from "@mui/x-charts";
import axios from "axios";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

dayjs.extend(relativeTime);

// Thème personnalisé et styles
const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
  },
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 10,
    top: 10,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

// Composant principal
const AdminPanel = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState({
    dashboard: true,
    users: true,
    orders: true,
    activities: true,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: [null, null],
  });
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // API Endpoints
  const API_ENDPOINTS = {
    DASHBOARD: "/api/admin/dashboard",
    USERS: "/api/users",
    ORDERS: "/api/admin/orders",
    ACTIVITIES: "/api/admin/activities",
    NOTIFICATIONS: "/api/admin/notifications",
    CREATE_USER: "/api/admin/users/create",
    UPDATE_USER: (id) => `/api/admin/users/${id}/update`,
    DELETE_USER: (id) => `/api/admin/users/${id}/delete`,
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        dashboard: true,
        users: true,
        activities: true,
      }));

      const [
        dashboardRes,
        activitiesRes,
        usersRes,
        ordersRes,
        notificationsRes,
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.DASHBOARD),
        axios.get(API_ENDPOINTS.ACTIVITIES),
        axios.get(API_ENDPOINTS.USERS, {
          params: {
            page: pagination.page + 1,
            limit: pagination.pageSize,
            search: filters.search,
            status: filters.status !== "all" ? filters.status : undefined,
            from: filters.dateRange[0]?.toISOString(),
            to: filters.dateRange[1]?.toISOString(),
          },
        }),
        axios.get(API_ENDPOINTS.ORDERS),
        axios.get(API_ENDPOINTS.NOTIFICATIONS),
      ]);

      setDashboardData(dashboardRes.data);
      setRecentActivities(activitiesRes.data);
      setUsers(usersRes.data.users);
      setOrders(ordersRes.data);
      setNotifications(notificationsRes.data);
      setPagination((prev) => ({ ...prev, total: usersRes.data.total }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading({
        dashboard: false,
        users: false,
        orders: false,
        activities: false,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.pageSize, filters, refreshKey]);

  // Handle user operations
  const handleCreateUser = async (userData) => {
    try {
      await axios.post(API_ENDPOINTS.CREATE_USER, userData);
      setRefreshKey((prev) => prev + 1);
      setOpenUserDialog(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      await axios.put(API_ENDPOINTS.UPDATE_USER(id), userData);
      setRefreshKey((prev) => prev + 1);
      setOpenUserDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_USER(id));
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Stats cards data
  const stats = [
    {
      title: "Utilisateurs",
      value: dashboardData?.total_users || 0,
      change: `${dashboardData?.user_growth || 0}%`,
      icon: <UsersIcon sx={{ color: "#5C6BC0", fontSize: "2rem" }} />,
      progress: dashboardData?.user_growth || 0,
      endpoint: "/admin/users",
    },
    {
      title: "Commandes",
      value: dashboardData?.total_orders || 0,
      change: `${dashboardData?.order_growth || 0}%`,
      icon: <ShippingIcon sx={{ color: "#66BB6A", fontSize: "2rem" }} />,
      progress: dashboardData?.total_orders / 100 || 0,
      endpoint: "/admin/orders",
    },
    {
      title: "Revenus",
      value: `$${(dashboardData?.total_revenue || 0).toLocaleString()}`,
      change: `${dashboardData?.revenue_growth || 0}%`,
      icon: <RevenueIcon sx={{ color: "#FFA726", fontSize: "2rem" }} />,
      progress: dashboardData?.revenue_growth || 0,
      endpoint: "/admin/finances",
    },
    {
      title: "Performances",
      value: `${dashboardData?.performance || 0}%`,
      change: "+5%",
      icon: <StatsIcon sx={{ color: "#EC407A", fontSize: "2rem" }} />,
      progress: dashboardData?.performance || 0,
      endpoint: "/admin/analytics",
    },
  ];

  // Users columns
  const usersColumns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.value} sx={{ width: 36, height: 36 }}>
          {params.row.name.charAt(0)}
        </Avatar>
      ),
    },
    { field: "name", headerName: "Nom", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    {
      field: "role",
      headerName: "Rôle",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === "admin"
              ? "primary"
              : params.value === "moderator"
              ? "secondary"
              : "default"
          }
          sx={{ borderRadius: "6px", textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Statut",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Actif" : "Inactif"}
          size="small"
          color={params.value ? "success" : "error"}
          sx={{ borderRadius: "6px" }}
        />
      ),
    },
    {
      field: "last_login",
      headerName: "Dernière connexion",
      width: 180,
      valueFormatter: (params) =>
        params.value
          ? dayjs(params.value).format("DD/MM/YYYY HH:mm")
          : "Jamais",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Modifier">
            <IconButton
              onClick={() => {
                setCurrentUser(params.row);
                setOpenUserDialog(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => handleDeleteUser(params.row.id)}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Orders columns
  const ordersColumns = [
    { field: "id", headerName: "Commande", width: 100 },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      valueFormatter: (params) => dayjs(params.value).format("DD/MM/YYYY"),
    },
    { field: "customer", headerName: "Client", width: 180 },
    { field: "total", headerName: "Total", width: 100 },
    {
      field: "status",
      headerName: "Statut",
      width: 130,
      renderCell: (params) => {
        const statusColors = {
          completed: "success",
          pending: "warning",
          cancelled: "error",
          shipped: "info",
        };
        return (
          <Chip
            label={params.value}
            size="small"
            color={statusColors[params.value] || "default"}
            sx={{ borderRadius: "6px", textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: () => (
        <Button size="small" variant="outlined">
          Détails
        </Button>
      ),
    },
  ];

  // Chart data
  const lineChartData = {
    xAxis: [
      {
        data:
          dashboardData?.monthly_revenue?.map((item) =>
            dayjs(item.month).format("MMM")
          ) || [],
      },
    ],
    series: [
      {
        data: dashboardData?.monthly_revenue?.map((item) => item.revenue) || [],
        area: true,
        color: "#5C6BC0",
      },
    ],
  };

  const barChartData = {
    xAxis: [
      {
        data:
          dashboardData?.weekly_orders?.map((item) =>
            dayjs(item.week).format("DD/MM")
          ) || [],
      },
    ],
    series: [
      {
        data: dashboardData?.weekly_orders?.map((item) => item.count) || [],
        color: "#66BB6A",
      },
    ],
  };

  const pieChartData = dashboardData?.device_distribution || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A237E" }}>
            Tableau de bord Admin
          </Typography>
          <Box>
            <Tooltip title="Actualiser">
              <IconButton onClick={() => setRefreshKey((prev) => prev + 1)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton>
                <StatusBadge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </StatusBadge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <PremiumCard>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "text.secondary" }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          mt: 1,
                          background: "rgba(92, 107, 192, 0.1)",
                          color: "#5C6BC0",
                          fontWeight: 600,
                        }}
                        icon={
                          <GrowthIcon
                            sx={{ fontSize: "1rem", color: "#5C6BC0" }}
                          />
                        }
                      />
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: "rgba(92, 107, 192, 0.1)",
                        width: 56,
                        height: 56,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(92, 107, 192, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #5C6BC0 0%, #3949AB 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </CardContent>
              </PremiumCard>
            </Grid>
          ))}
        </Grid>

        {/* Charts and Activities */}
        <Grid container spacing={4}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <PremiumCard>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Revenus mensuels
                  </Typography>
                  <Chip
                    label={dayjs().year()}
                    size="small"
                    sx={{
                      background: "rgba(92, 107, 192, 0.1)",
                      color: "#5C6BC0",
                      fontWeight: 600,
                    }}
                    icon={
                      <CalendarIcon
                        sx={{ fontSize: "1rem", color: "#5C6BC0" }}
                      />
                    }
                  />
                </Box>
                <Box sx={{ height: 300 }}>
                  {dashboardData?.monthly_revenue?.length > 0 ? (
                    <LineChart
                      {...lineChartData}
                      margin={{ top: 20, bottom: 30 }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      <CircularProgress />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={4}>
            <PremiumCard>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Activités récentes
                  </Typography>
                  <Button size="small" endIcon={<FilterIcon />}>
                    Filtrer
                  </Button>
                </Box>
                <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                  {recentActivities.map((activity) => (
                    <Box key={activity.id} sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "rgba(92, 107, 192, 0.1)",
                            width: 36,
                            height: 36,
                            mr: 2,
                            color: "#5C6BC0",
                          }}
                        >
                          {activity.type === "order" ? (
                            <ShippingIcon />
                          ) : (
                            <UsersIcon />
                          )}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500 }}
                          >
                            {activity.user_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {activity.description}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {dayjs(activity.created_at).fromNow()}
                        </Typography>
                      </Box>
                      <Divider />
                    </Box>
                  ))}
                  {recentActivities.length === 0 && (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", textAlign: "center" }}
                    >
                      Aucune activité récente
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>
        </Grid>

        {/* Orders Chart */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <PremiumCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Commandes hebdomadaires
              </Typography>
              <Box sx={{ height: 300 }}>
                {dashboardData?.weekly_orders?.length > 0 ? (
                  <BarChart
                    {...barChartData}
                    margin={{ top: 20, bottom: 30 }}
                  />
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>

        {/* Users Table */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <PremiumCard>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Utilisateurs
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Rechercher..."
                      InputProps={{
                        startAdornment: <SearchIcon fontSize="small" />,
                      }}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={filters.status}
                        label="Statut"
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                      >
                        <MenuItem value="all">Tous</MenuItem>
                        <MenuItem value="active">Actifs</MenuItem>
                        <MenuItem value="inactive">Inactifs</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setCurrentUser(null);
                        setOpenUserDialog(true);
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ height: 500 }}>
                  <DataGrid
                    rows={users}
                    columns={usersColumns}
                    pageSize={pagination.pageSize}
                    page={pagination.page}
                    rowCount={pagination.total}
                    onPageChange={(newPage) =>
                      setPagination({ ...pagination, page: newPage })
                    }
                    onPageSizeChange={(newPageSize) =>
                      setPagination({ ...pagination, pageSize: newPageSize })
                    }
                    rowsPerPageOptions={[5, 10, 25]}
                    paginationMode="server"
                    loading={loading.users}
                    components={{ Toolbar: GridToolbar }}
                  />
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <PremiumCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Appareils utilisés
                </Typography>
                <Box sx={{ height: 300 }}>
                  {pieChartData.length > 0 ? (
                    <>
                      <PieChart
                        series={[
                          {
                            data: pieChartData,
                            innerRadius: 50,
                            outerRadius: 100,
                            paddingAngle: 5,
                            cornerRadius: 5,
                          },
                        ]}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        {pieChartData.map((item) => (
                          <Box
                            key={item.id}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                bgcolor: item.color,
                                borderRadius: "2px",
                                mr: 1,
                              }}
                            />
                            <Typography variant="caption">
                              {item.label} ({item.value}%)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      <CircularProgress />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>
        </Grid>

        {/* Orders Table */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <PremiumCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Dernières commandes
              </Typography>
              <Box sx={{ height: 400 }}>
                <DataGrid
                  rows={orders}
                  columns={ordersColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 25]}
                  loading={loading.orders}
                  components={{ Toolbar: GridToolbar }}
                />
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>

        {/* User Dialog */}
        <Dialog
          open={openUserDialog}
          onClose={() => setOpenUserDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentUser
              ? "Modifier l'utilisateur"
              : "Créer un nouvel utilisateur"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    defaultValue={currentUser?.name || ""}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    defaultValue={currentUser?.email || ""}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      label="Rôle"
                      defaultValue={currentUser?.role || "user"}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="moderator">Modérateur</MenuItem>
                      <MenuItem value="user">Utilisateur</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Statut</InputLabel>
                    <Select
                      label="Statut"
                      defaultValue={currentUser?.status ? "active" : "inactive"}
                    >
                      <MenuItem value="active">Actif</MenuItem>
                      <MenuItem value="inactive">Inactif</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {!currentUser && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirmer le mot de passe"
                        type="password"
                        margin="normal"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUserDialog(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={() =>
                currentUser
                  ? handleUpdateUser(currentUser.id, {
                      /* user data */
                    })
                  : handleCreateUser({
                      /* user data */
                    })
              }
            >
              {currentUser ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminPanel;
