import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";

const Topbar = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/notifications");
        setNotifications(response.data.notifications || []); // Assurez-vous que c'est un tableau
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des notifications :",
          err
        );
        setNotifications([]); // Définit un tableau vide en cas d'erreur
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notifications
          .filter((n) => n.isUnread)
          .map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
      </ul>
    </div>
  );
};

export default Topbar;
