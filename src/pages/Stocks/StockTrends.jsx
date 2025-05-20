import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import { Equalizer, TrendingUp, TrendingDown } from "@mui/icons-material";
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
  // Process trend data for the chart
  const processTrendData = () => {
    if (!trends || trends.length === 0) return [];

    return trends.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString(),
      quantity: trend.quantity,
      minQuantity: trend.minQuantity,
    }));
  };

  const trendData = processTrendData();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "info.main" }}>
          <Equalizer />
        </Avatar>
        Stock Trends Analysis {stockId && `(ID: ${stockId})`}
      </DialogTitle>
      <DialogContent dividers>
        {trendData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No trend data available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: "400px", mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="Current Quantity"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="minQuantity"
                  name="Minimum Quantity"
                  stroke="#ff7300"
                />
              </LineChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 4, display: "flex", gap: 4 }}>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Trend Analysis
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {trendData.length > 1 && (
                    <>
                      {trendData[0].quantity <
                      trendData[trendData.length - 1].quantity ? (
                        <>
                          <TrendingUp color="success" />
                          <Typography color="success.main">
                            Increasing trend (+
                            {trendData[trendData.length - 1].quantity -
                              trendData[0].quantity}
                            )
                          </Typography>
                        </>
                      ) : (
                        <>
                          <TrendingDown color="error" />
                          <Typography color="error.main">
                            Decreasing trend (
                            {trendData[trendData.length - 1].quantity -
                              trendData[0].quantity}
                            )
                          </Typography>
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockTrends;
