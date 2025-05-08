import React from "react";
import { RecentOrders } from "./tables/RecentOrders"; // Utilisez des accolades pour un export nommé

const Dashboard = () => {
  return (
    <div>
      <h1>Tableau de bord</h1>
      <RecentOrders />
    </div>
  );
};

export default Dashboard;
