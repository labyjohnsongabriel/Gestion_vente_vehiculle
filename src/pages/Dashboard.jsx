import React from "react";
import {
  Grid,
  Paper,
  Container,
  Typography,
  Box,
  useTheme,
  Fab,
  Tooltip,
} from "@mui/material";
import { BudgetCard } from "../components/cards/BudgetCard";
import { CustomersCard } from "../components/cards/CustomersCard";
import { ProgressCard } from "../components/cards/ProgressCard";
import { ProfitCard } from "../components/cards/ProfitCard";
import SalesChart from "../components/charts/SalesChart";
//import {ProfessionalStatsCard}
//import { TrafficChart } from "../components/charts/TrafficChart";
import { RecentOrders } from "../components/tables/RecentOrders";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useCustomTheme } from "../components/context/ThemeContext.jsx";

import Footer  from "../components/Recherche/footer"; 
import "../styles/dashboard.css";
import { ProfessionalStatsCard } from './../components/cards/ProfessionalStatsCard';

 const Dashboard = () => {
  const theme = useTheme();
  const { toggleTheme, mode } = useCustomTheme();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h2"
        className="dashboard-title"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#333",
          textAlign: "left",
          marginBottom: "20px",
        }}
      >
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        {/* Cartes de statistiques */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-card">
            <BudgetCard />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-card">
            <CustomersCard />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-card">
            <ProgressCard />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-card">
            <ProfitCard />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-card">
            <ProfessionalStatsCard />
          </Paper>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 6,
              display: "flex",
              flexDirection: "column",
              height: 800,
              width: 1470,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ventes mensuelles
            </Typography>
            <SalesChart />
          </Paper>
        </Grid>

        {/* Tableau des commandes récentes */}
        {/* <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 400,
              width: 1470,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Commandes récentes
            </Typography>
            <RecentOrders />
          </Paper>
        </Grid>*/}
      </Grid>

      {/*
      <Tooltip title="Changer le thème" placement="left">
        <Fab
          size="medium"
          color="primary"
          onClick={toggleTheme}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 40,
            zIndex: 100,
          }}
        >
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </Fab>
      </Tooltip>*/}
    </Container>
  );
};
export default Dashboard;
