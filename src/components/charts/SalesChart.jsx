import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Bar,
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
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import axios from "axios";

const VENTES_API_URL = "http://localhost:5000/api/ventes";
const COMMANDES_API_URL = "http://localhost:5000/api/commandes";

const SalesChart = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState("year");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données des ventes et des commandes en parallèle
      const [ventesResponse, commandesResponse] = await Promise.all([
        axios.get(VENTES_API_URL),
        axios.get(COMMANDES_API_URL),
      ]);

      const ventes = ventesResponse.data;
      const commandes = commandesResponse.data;

      // Traiter les données pour les combiner
      const processedData = processCombinedData(ventes, commandes, period);
      setData(processedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError("Erreur lors du chargement des données");
      setData(getFallbackData(period));
    } finally {
      setLoading(false);
    }
  };

  const processCombinedData = (ventes, commandes, selectedPeriod) => {
    if (
      (!Array.isArray(ventes) || ventes.length === 0) &&
      (!Array.isArray(commandes) || commandes.length === 0)
    ) {
      return getFallbackData(selectedPeriod);
    }

    const now = new Date();
    let processedData = [];

    switch (selectedPeriod) {
      case "day":
        processedData = getLast7DaysData(ventes, commandes, now);
        break;
      case "week":
        processedData = getLast4WeeksData(ventes, commandes, now);
        break;
      case "year":
      default:
        processedData = getLast12MonthsData(ventes, commandes, now);
        break;
    }

    return processedData;
  };

  const getLast7DaysData = (ventes, commandes, now) => {
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];

      // Filtrer les ventes pour ce jour
      const dayVentes = Array.isArray(ventes)
        ? ventes.filter((vente) => {
            const venteDate = new Date(vente.date_vente || vente.created_at);
            return venteDate.toDateString() === date.toDateString();
          })
        : [];

      // Filtrer les commandes pour ce jour
      const dayCommandes = Array.isArray(commandes)
        ? commandes.filter((commande) => {
            const commandeDate = new Date(
              commande.date_commande || commande.created_at
            );
            return commandeDate.toDateString() === date.toDateString();
          })
        : [];

      // Calculer les totaux
      const totalSales = dayVentes.reduce((sum, vente) => {
        return sum + (parseFloat(vente.prix_total) || 0);
      }, 0);

      const totalOrdersValue = dayCommandes.reduce((sum, commande) => {
        return sum + (parseFloat(commande.montant) || 0);
      }, 0);

      data.push({
        name: dayName,
        date: date.toISOString().split("T")[0],
        ventes: Math.round(totalSales),
        commandes: Math.round(totalOrdersValue),
        countVentes: dayVentes.length,
        countCommandes: dayCommandes.length,
      });
    }

    return data;
  };

  const getLast4WeeksData = (ventes, commandes, now) => {
    const data = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Filtrer les ventes pour cette semaine
      const weekVentes = Array.isArray(ventes)
        ? ventes.filter((vente) => {
            const venteDate = new Date(vente.date_vente || vente.created_at);
            return venteDate >= weekStart && venteDate <= weekEnd;
          })
        : [];

      // Filtrer les commandes pour cette semaine
      const weekCommandes = Array.isArray(commandes)
        ? commandes.filter((commande) => {
            const commandeDate = new Date(
              commande.date_commande || commande.created_at
            );
            return commandeDate >= weekStart && commandeDate <= weekEnd;
          })
        : [];

      // Calculer les totaux
      const totalSales = weekVentes.reduce((sum, vente) => {
        return sum + (parseFloat(vente.prix_total) || 0);
      }, 0);

      const totalOrdersValue = weekCommandes.reduce((sum, commande) => {
        return sum + (parseFloat(commande.montant) || 0);
      }, 0);

      data.push({
        name: `S${4 - i}`,
        date: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        ventes: Math.round(totalSales),
        commandes: Math.round(totalOrdersValue),
        countVentes: weekVentes.length,
        countCommandes: weekCommandes.length,
      });
    }

    return data;
  };

  const getLast12MonthsData = (ventes, commandes, now) => {
    const monthNames = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];

      // Filtrer les ventes pour ce mois
      const monthVentes = Array.isArray(ventes)
        ? ventes.filter((vente) => {
            const venteDate = new Date(vente.date_vente || vente.created_at);
            return (
              venteDate.getMonth() === date.getMonth() &&
              venteDate.getFullYear() === date.getFullYear()
            );
          })
        : [];

      // Filtrer les commandes pour ce mois
      const monthCommandes = Array.isArray(commandes)
        ? commandes.filter((commande) => {
            const commandeDate = new Date(
              commande.date_commande || commande.created_at
            );
            return (
              commandeDate.getMonth() === date.getMonth() &&
              commandeDate.getFullYear() === date.getFullYear()
            );
          })
        : [];

      // Calculer les totaux
      const totalSales = monthVentes.reduce((sum, vente) => {
        return sum + (parseFloat(vente.prix_total) || 0);
      }, 0);

      const totalOrdersValue = monthCommandes.reduce((sum, commande) => {
        return sum + (parseFloat(commande.montant) || 0);
      }, 0);

      data.push({
        name: monthName,
        date: `${monthName} ${date.getFullYear()}`,
        ventes: Math.round(totalSales),
        commandes: Math.round(totalOrdersValue),
        countVentes: monthVentes.length,
        countCommandes: monthCommandes.length,
      });
    }

    return data;
  };

  const getFallbackData = (selectedPeriod) => {
    switch (selectedPeriod) {
      case "day":
        return [
          {
            name: "Lun",
            ventes: 400,
            commandes: 350,
            countVentes: 8,
            countCommandes: 7,
          },
          {
            name: "Mar",
            ventes: 500,
            commandes: 450,
            countVentes: 10,
            countCommandes: 9,
          },
          {
            name: "Mer",
            ventes: 300,
            commandes: 280,
            countVentes: 6,
            countCommandes: 5,
          },
          {
            name: "Jeu",
            ventes: 700,
            commandes: 650,
            countVentes: 14,
            countCommandes: 13,
          },
          {
            name: "Ven",
            ventes: 600,
            commandes: 550,
            countVentes: 12,
            countCommandes: 11,
          },
          {
            name: "Sam",
            ventes: 500,
            commandes: 480,
            countVentes: 10,
            countCommandes: 9,
          },
          {
            name: "Dim",
            ventes: 450,
            commandes: 420,
            countVentes: 9,
            countCommandes: 8,
          },
        ];
      case "week":
        return [
          {
            name: "S1",
            ventes: 3000,
            commandes: 2800,
            countVentes: 60,
            countCommandes: 56,
          },
          {
            name: "S2",
            ventes: 3500,
            commandes: 3200,
            countVentes: 70,
            countCommandes: 64,
          },
          {
            name: "S3",
            ventes: 4000,
            commandes: 3800,
            countVentes: 80,
            countCommandes: 76,
          },
          {
            name: "S4",
            ventes: 4500,
            commandes: 4200,
            countVentes: 90,
            countCommandes: 84,
          },
        ];
      default:
        return [
          {
            name: "Jan",
            ventes: 4000,
            commandes: 3800,
            countVentes: 80,
            countCommandes: 76,
          },
          {
            name: "Fév",
            ventes: 3000,
            commandes: 2800,
            countVentes: 60,
            countCommandes: 56,
          },
          {
            name: "Mar",
            ventes: 5000,
            commandes: 4800,
            countVentes: 100,
            countCommandes: 96,
          },
          {
            name: "Avr",
            ventes: 2780,
            commandes: 2600,
            countVentes: 56,
            countCommandes: 52,
          },
          {
            name: "Mai",
            ventes: 1890,
            commandes: 1700,
            countVentes: 38,
            countCommandes: 34,
          },
          {
            name: "Juin",
            ventes: 2390,
            commandes: 2200,
            countVentes: 48,
            countCommandes: 44,
          },
          {
            name: "Juil",
            ventes: 3490,
            commandes: 3300,
            countVentes: 70,
            countCommandes: 66,
          },
          {
            name: "Août",
            ventes: 4000,
            commandes: 3800,
            countVentes: 80,
            countCommandes: 76,
          },
          {
            name: "Sep",
            ventes: 4500,
            commandes: 4300,
            countVentes: 90,
            countCommandes: 86,
          },
          {
            name: "Oct",
            ventes: 5200,
            commandes: 5000,
            countVentes: 104,
            countCommandes: 100,
          },
          {
            name: "Nov",
            ventes: 4800,
            commandes: 4600,
            countVentes: 96,
            countCommandes: 92,
          },
          {
            name: "Déc",
            ventes: 6000,
            commandes: 5800,
            countVentes: 120,
            countCommandes: 116,
          },
        ];
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleChange = (event) => {
    setPeriod(event.target.value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const currentData = data.find((item) => item.name === label);

      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4],
            p: 2,
            minWidth: 220,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}
          >
            {currentData?.date || label}
          </Typography>

          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: entry.color,
                mb: 0.5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 600, marginLeft: "8px" }}>
                {typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : entry.value}
                {entry.dataKey === "ventes" || entry.dataKey === "commandes"
                  ? " €"
                  : ""}
              </span>
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 3,
        backgroundColor: theme.palette.background.default,
      }}
    >
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error} - Affichage des données d'exemple
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            Tableau de Bord des Ventes et Commandes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyse comparative des performances commerciales
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: 150,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <InputLabel>Période</InputLabel>
          <Select value={period} label="Période" onChange={handleChange}>
            <MenuItem value="day">7 derniers jours</MenuItem>
            <MenuItem value="week">4 dernières semaines</MenuItem>
            <MenuItem value="year">12 derniers mois</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          p: 3,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: theme.palette.text.secondary }}
              tickFormatter={(value) => `${value}€`}
              label={{
                value: "Montant (€)",
                angle: -90,
                position: "insideLeft",
                style: { fill: theme.palette.text.primary },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: theme.palette.text.secondary }}
              label={{
                value: "Quantité",
                angle: 90,
                position: "insideRight",
                style: { fill: theme.palette.text.primary },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="ventes"
              name="Ventes (€)"
              fill="#4caf50"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="commandes"
              name="Commandes (€)"
              fill="#ff9800"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="countVentes"
              name="Nb. Ventes"
              stroke="#2196f3"
              strokeWidth={2}
              dot={{ fill: "#2196f3", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#2196f3" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="countCommandes"
              name="Nb. Commandes"
              stroke="#9c27b0"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ fill: "#9c27b0", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#9c27b0" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
        >
          Résumé des Performances
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#4caf50",
                  borderRadius: "2px",
                }}
              />
              <Typography variant="body2" fontWeight="medium">
                Total Ventes:{" "}
                {data
                  .reduce((sum, item) => sum + item.ventes, 0)
                  .toLocaleString()}{" "}
                €
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ff9800",
                  borderRadius: "2px",
                }}
              />
              <Typography variant="body2" fontWeight="medium">
                Total Commandes:{" "}
                {data
                  .reduce((sum, item) => sum + item.commandes, 0)
                  .toLocaleString()}{" "}
                €
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#2196f3",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2" fontWeight="medium">
                Nb. Total Ventes:{" "}
                {data.reduce((sum, item) => sum + item.countVentes, 0)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#9c27b0",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2" fontWeight="medium">
                Nb. Total Commandes:{" "}
                {data.reduce((sum, item) => sum + item.countCommandes, 0)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Panier moyen Ventes:{" "}
              {Math.round(
                data.reduce((sum, item) => sum + item.ventes, 0) /
                  Math.max(
                    data.reduce((sum, item) => sum + item.countVentes, 0),
                    1
                  )
              )}{" "}
              €
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Panier moyen Commandes:{" "}
              {Math.round(
                data.reduce((sum, item) => sum + item.commandes, 0) /
                  Math.max(
                    data.reduce((sum, item) => sum + item.countCommandes, 0),
                    1
                  )
              )}{" "}
              €
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SalesChart;
