import React, { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Notifications } from "@mui/icons-material";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des notifications :",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour de la notification :",
        err.message
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Notifications
      </Typography>
      <List>
        {notifications.map((notif) => (
          <ListItem
            key={notif.id}
            sx={{ mb: 1, background: "#f5f5f5", borderRadius: 2 }}
          >
            <ListItemText
              primary={notif.message}
              secondary={new Date(notif.created_at).toLocaleString()}
            />
            <IconButton onClick={() => markAsRead(notif.id)}>
              <CheckCircle color="success" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationList;
