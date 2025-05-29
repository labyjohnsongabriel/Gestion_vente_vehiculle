import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Equalizer, Timeline } from "@mui/icons-material";
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

const StockTrends = ({ open, onClose, trends, stockId }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Equalizer color="info" />
          <Typography variant="h6">Tendances du stock</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Stock ID: {stockId}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {trends.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Données insuffisantes pour afficher les tendances
            </Typography>
          </Box>
        ) : (
          <Box height={400} mt={2}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Quantité"
                />
                <Line
                  type="monotone"
                  dataKey="min_quantity"
                  stroke="#82ca9d"
                  name="Quantité minimale"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockTrends;