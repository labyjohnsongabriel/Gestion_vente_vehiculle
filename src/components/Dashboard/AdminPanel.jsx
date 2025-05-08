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
} from "@mui/material";
import {
  People as UsersIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as RevenueIcon,
  Assessment as StatsIcon,
  TrendingUp as GrowthIcon,
  Event as CalendarIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart, PieChart } from "@mui/x-charts";
import axios from "axios";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

// Composants stylisés
const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
  },
}));

const AdminPanel = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, activitiesRes, usersRes] = await Promise.all([
          axios.get("/api/admin/dashboard"),
          axios.get("/api/admin/activities"),
          axios.get("/api/admin/users"),
        ]);

        setDashboardData(dashboardRes.data);
        setRecentActivities(activitiesRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Données statistiques
  const stats = [
    {
      title: "Utilisateurs",
      value: dashboardData?.total_users || 0,
      change: `${dashboardData?.user_growth || 0}%`,
      icon: <UsersIcon sx={{ color: "#5C6BC0", fontSize: "2rem" }} />,
      progress: dashboardData?.user_growth || 0,
    },
    {
      title: "Commandes",
      value: dashboardData?.total_orders || 0,
      change: `${dashboardData?.order_growth || 0}%`,
      icon: <ShippingIcon sx={{ color: "#66BB6A", fontSize: "2rem" }} />,
      progress: dashboardData?.total_orders / 100 || 0,
    },
    {
      title: "Revenus",
      value: `$${(dashboardData?.total_revenue || 0).toLocaleString()}`,
      change: `${dashboardData?.revenue_growth || 0}%`,
      icon: <RevenueIcon sx={{ color: "#FFA726", fontSize: "2rem" }} />,
      progress: dashboardData?.revenue_growth || 0,
    },
    {
      title: "Performances",
      value: `${dashboardData?.performance || 0}%`,
      change: "+5%",
      icon: <StatsIcon sx={{ color: "#EC407A", fontSize: "2rem" }} />,
      progress: dashboardData?.performance || 0,
    },
  ];

  // Colonnes pour le tableau des utilisateurs
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
        dayjs(params.value).format("DD/MM/YYYY HH:mm"),
    },
  ];

  // Données graphiques
  const lineChartData = {
    xAxis: [
      {
        data:
          dashboardData?.monthly_revenue.map((item) =>
            dayjs(item.month).format("MMM")
          ) || [],
      },
    ],
    series: [
      {
        data: dashboardData?.monthly_revenue.map((item) => item.revenue) || [],
        area: true,
        color: "#5C6BC0",
      },
    ],
  };

  const pieChartData = dashboardData?.device_distribution || [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 700, color: "#1A237E" }}
      >
        Tableau de bord Admin
      </Typography>

      {/* Cartes statistiques */}
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

      {/* Graphiques et activités */}
      <Grid container spacing={4}>
        {/* Graphique linéaire */}
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
                    <CalendarIcon sx={{ fontSize: "1rem", color: "#5C6BC0" }} />
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
                    <Typography>Aucune donnée disponible</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>

        {/* Dernières activités */}
        <Grid item xs={12} md={4}>
          <PremiumCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activités récentes
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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

      {/* Tableau utilisateurs et graphique camembert */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Tableau utilisateurs */}
        <Grid item xs={12} md={8}>
          <PremiumCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Derniers utilisateurs
              </Typography>
              <Box sx={{ height: 400 }}>
                <DataGrid
                  rows={users}
                  columns={usersColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                  loading={loading}
                />
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>

        {/* Graphique camembert */}
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
                    <Typography>Aucune donnée disponible</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPanel;
