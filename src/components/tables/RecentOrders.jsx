import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import { Box } from "@mui/material";

const rows = [
  {
    id: 1,
    customer: "Jean Dupont",
    product: "Plaquettes de frein",
    date: "2023-05-01",
    status: "Livré",
    amount: 120,
  },
  {
    id: 2,
    customer: "Marie Martin",
    product: "Filtre à huile",
    date: "2023-05-02",
    status: "En cours",
    amount: 25,
  },
  {
    id: 3,
    customer: "Pierre Durand",
    product: "Batterie",
    date: "2023-05-03",
    status: "Annulé",
    amount: 150,
  },
  {
    id: 4,
    customer: "Sophie Lambert",
    product: "Pneus (4)",
    date: "2023-05-04",
    status: "Livré",
    amount: 480,
  },
  {
    id: 5,
    customer: "Thomas Leroy",
    product: "Amortisseurs",
    date: "2023-05-05",
    status: "En cours",
    amount: 320,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Livré":
      return "success";
    case "En cours":
      return "warning";
    case "Annulé":
      return "error";
    default:
      return "default";
  }
};

export const RecentOrders = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="Commandes récentes">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Produit</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell align="right">Montant</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                  {row.customer}
                </Box>
              </TableCell>
              <TableCell>{row.product}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  color={getStatusColor(row.status)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">${row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
