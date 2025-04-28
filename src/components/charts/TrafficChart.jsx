import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Site web", value: 400 },
  { name: "Réseaux sociaux", value: 300 },
  { name: "Publicité", value: 200 },
  { name: "Autres", value: 100 },
];

import "../../index.css";

const COLORS = ["#1976d2", "#9c27b0", "#ff9800", "#4caf50"];

export const TrafficChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100} // Augmenter le rayon pour un graphique plus grand
          innerRadius={50}
          label
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: 8,
            border: "1px solid #ddd",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Ombre subtile pour l'info-bulle
          }}
        />
        <Legend
          iconSize={25} // Augmenter la taille des icônes de la légende
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          wrapperStyle={{
            paddingTop: 10,
            color: "#555", // Couleur discrète pour le texte de la légende
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
