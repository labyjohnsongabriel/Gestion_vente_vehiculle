import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  styled,
  LinearProgress,
  Avatar,
  Chip
} from '@mui/material';
import {
  People as UsersIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as RevenueIcon,
  Assessment as StatsIcon,
  TrendingUp as GrowthIcon,
  Event as CalendarIcon,
  Notifications as AlertsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart, PieChart } from '@mui/x-charts';
import List from "@mui/material/List";


// Composants stylisés premium
const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(255,255,255,0.3)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
  }
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 'none',
  '& .MuiDataGrid-columnHeaders': {
    background: 'linear-gradient(135deg, #3a5169 0%, #2a2a4a 100%)',
    color: theme.palette.common.white,
    borderRadius: '12px 12px 0 0'
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  '& .MuiDataGrid-row:hover': {
    background: 'rgba(92, 107, 192, 0.08)'
  }
}));

const AdminPanel = () => {
  const theme = useTheme();

  // Données statistiques
  const stats = [
    {
      title: "Utilisateurs",
      value: "2,456",
      change: "+12%",
      icon: <UsersIcon sx={{ color: "#5C6BC0", fontSize: "2rem" }} />,
      progress: 75
    },
    {
      title: "Commandes",
      value: "1,230",
      change: "+8%",
      icon: <ShippingIcon sx={{ color: "#66BB6A", fontSize: "2rem" }} />,
      progress: 60
    },
    {
      title: "Revenus",
      value: "$34,580",
      change: "+24%",
      icon: <RevenueIcon sx={{ color: "#FFA726", fontSize: "2rem" }} />,
      progress: 85
    },
    {
      title: "Performances",
      value: "89%",
      change: "+5%",
      icon: <StatsIcon sx={{ color: "#EC407A", fontSize: "2rem" }} />,
      progress: 89
    }
  ];

  // Dernières activités
  const activities = [
    { id: 1, user: "Jean Dupont", action: "Nouvelle commande", time: "2 min", icon: <ShippingIcon /> },
    { id: 2, user: "Marie Lambert", action: "Inscription", time: "15 min", icon: <UsersIcon /> },
    { id: 3, user: "Pierre Martin", action: "Paiement reçu", time: "1h", icon: <RevenueIcon /> },
    { id: 4, user: "Sophie Leroy", action: "Demande support", time: "3h", icon: <AlertsIcon /> }
  ];

  // Derniers utilisateurs
  const usersColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'avatar', 
      headerName: '', 
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.value} sx={{ width: 36, height: 36 }} />
      )
    },
    { field: 'name', headerName: 'Nom', width: 180 },
    { field: 'email', headerName: 'Email', width: 220 },
    { 
      field: 'status', 
      headerName: 'Statut', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'Actif' ? 'success' : 'error'} 
          sx={{ borderRadius: '6px' }}
        />
      )
    },
    { field: 'lastLogin', headerName: 'Dernière connexion', width: 180 }
  ];

  const usersRows = [
    { id: 1, avatar: '', name: 'Jean Dupont', email: 'jean@example.com', status: 'Actif', lastLogin: '2023-05-15 09:30' },
    { id: 2, avatar: '', name: 'Marie Lambert', email: 'marie@example.com', status: 'Actif', lastLogin: '2023-05-14 14:20' },
    { id: 3, avatar: '', name: 'Pierre Martin', email: 'pierre@example.com', status: 'Inactif', lastLogin: '2023-05-10 11:45' },
    { id: 4, avatar: '', name: 'Sophie Leroy', email: 'sophie@example.com', status: 'Actif', lastLogin: '2023-05-15 08:15' }
  ];

  // Données graphiques
  const lineChartData = {
    xAxis: [{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }],
    series: [
      {
        data: [4000, 3000, 6000, 8000, 5000, 7000],
        area: true,
        color: '#5C6BC0'
      }
    ]
  };

  const pieChartData = [
    { id: 0, value: 35, label: 'Mobile', color: '#5C6BC0' },
    { id: 1, value: 25, label: 'Tablette', color: '#66BB6A' },
    { id: 2, value: 40, label: 'Desktop', color: '#FFA726' }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#1A237E' }}>
        Tableau de bord Admin
      </Typography>

      {/* Cartes statistiques */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <PremiumCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
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
                        background: 'rgba(92, 107, 192, 0.1)',
                        color: '#5C6BC0',
                        fontWeight: 600
                      }}
                      icon={<GrowthIcon sx={{ fontSize: '1rem', color: '#5C6BC0' }} />}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stat.progress} 
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    background: 'rgba(92, 107, 192, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #5C6BC0 0%, #3949AB 100%)',
                      borderRadius: 4
                    }
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Performances mensuelles
                </Typography>
                <Chip 
                  label="2023" 
                  size="small" 
                  sx={{ 
                    background: 'rgba(92, 107, 192, 0.1)',
                    color: '#5C6BC0',
                    fontWeight: 600
                  }}
                  icon={<CalendarIcon sx={{ fontSize: '1rem', color: '#5C6BC0' }} />}
                />
              </Box>
              <Box sx={{ height: 300 }}>
                <LineChart
                  {...lineChartData}
                  margin={{ top: 20, bottom: 30 }}
                />
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
              <List sx={{ p: 0 }}>
                {activities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      py: 1.5,
                      px: 1,
                      borderRadius: '8px',
                      '&:hover': {
                        background: 'rgba(92, 107, 192, 0.05)'
                      }
                    }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(92, 107, 192, 0.1)', 
                        width: 36, 
                        height: 36,
                        mr: 2,
                        color: '#5C6BC0'
                      }}>
                        {activity.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {activity.user}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {activity.action}
                        </Typography>
                      </Box>
                      <Chip 
                        label={activity.time} 
                        size="small" 
                        sx={{ 
                          background: 'rgba(92, 107, 192, 0.1)',
                          color: '#5C6BC0',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                  </React.Fragment>
                ))}
              </List>
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
                <StyledDataGrid
                  rows={usersRows}
                  columns={usersColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
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
                <PieChart
                  series={[
                    {
                      data: pieChartData,
                      innerRadius: 50,
                      outerRadius: 100,
                      paddingAngle: 5,
                      cornerRadius: 5,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' }
                    }
                  ]}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                {pieChartData.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: item.color,
                      borderRadius: '2px',
                      mr: 1
                    }} />
                    <Typography variant="caption">
                      {item.label} ({item.value}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPanel;