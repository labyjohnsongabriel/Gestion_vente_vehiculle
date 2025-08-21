import React from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import { Typography, Paper, Avatar } from "@mui/material";
import { LocalShipping, CheckCircle, ShoppingCart } from "@mui/icons-material";

const OrderTimeline = ({ orders }) => {
  return (
    <Timeline position="alternate">
      {orders.map((order, index) => (
        <TimelineItem key={order.id}>
          <TimelineSeparator>
            <TimelineDot
              color={
                order.status === "livre"
                  ? "success"
                  : order.status === "annule"
                  ? "error"
                  : "primary"
              }
            >
              {order.status === "livre" ? (
                <LocalShipping />
              ) : order.status === "annule" ? (
                <CheckCircle />
              ) : (
                <ShoppingCart />
              )}
            </TimelineDot>
            {index < orders.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Commande #{order.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(order.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {order.montant.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default OrderTimeline;
