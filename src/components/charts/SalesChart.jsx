import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import "../../styles/slide.css";

// Données pour chaque période
const dailyData = [
  { name: "Lun", sales: 400 },
  { name: "Mar", sales: 500 },
  { name: "Mer", sales: 300 },
  { name: "Jeu", sales: 700 },
  { name: "Ven", sales: 600 },
  { name: "Sam", sales: 500 },
  { name: "Dim", sales: 450 },
];

const weeklyData = [
  { name: "Semaine 1", sales: 3000 },
  { name: "Semaine 2", sales: 3500 },
  { name: "Semaine 3", sales: 4000 },
  { name: "Semaine 4", sales: 4500 },
];

const yearlyData = [
  { name: "Jan", sales: 4000 },
  { name: "Fév", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Avr", sales: 2780 },
  { name: "Mai", sales: 1890 },
  { name: "Juin", sales: 2390 },
  { name: "Juil", sales: 3490 },
  { name: "Août", sales: 4000 },
  { name: "Sep", sales: 4500 },
  { name: "Oct", sales: 5200 },
  { name: "Nov", sales: 4800 },
  { name: "Déc", sales: 6000 },
];

 const SalesChart = () => {
  const [period, setPeriod] = useState("year");

  // Choisir les données selon la période
  const getData = () => {
    if (period === "day") return dailyData;
    if (period === "week") return weeklyData;
    return yearlyData;
  };

  const handleChange = (event) => {
    setPeriod(event.target.value);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Statistiques de ventes
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Période</InputLabel>
          <Select value={period} label="Période" onChange={handleChange}>
            <MenuItem value="day">Par Jour</MenuItem>
            <MenuItem value="week">Par Semaine</MenuItem>
            <MenuItem value="year">Par Année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={getData()}>
          <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={{ stroke: "#d3d3d3" }}
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={{ stroke: "#d3d3d3" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              border: "1px solid #ddd",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 10, color: "#555" }} />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#4caf50"
            strokeWidth={3}
            activeDot={{
              r: 6,
              stroke: "#fff",
              strokeWidth: 2,
              fill: "#4caf50",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};


export default SalesChart;