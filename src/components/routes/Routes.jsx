import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Statistic from "../pages/Statistic";
import Reports from "../pages/Reports";

import Customers from "../pages/Customers";
import CustomersManage from "../pages/CustomersManage";
import CustomersAnalytics from "../pages/CustomersAnalytics";

import Inventory from "../pages/Inventory";
import InventoryStock from "../pages/InventoryStock";
import InventoryOrders from "../pages/InventoryOrders";

import Integrations from "../pages/Integrations";
import Setting from "../pages/Setting";

import Account from "../pages/Account";
import Profile from "../pages/Profile";
import Security from "../pages/Security";

import Errors from "../pages/Errors";
import Feedback from "../pages/Feedback";


import NotFound from "../pages/NotFound";

export const Routes = () => {
  return (
    <Router>
      <Routes>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/statistic" element={<Statistic />} />
        <Route path="/reports" element={<Reports />} />

        {/* Clients */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/manage" element={<CustomersManage />} />
        <Route path="/customers/analytics" element={<CustomersAnalytics />} />

        {/* Inventaire */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/stock" element={<InventoryStock />} />
        <Route path="/inventory/orders" element={<InventoryOrders />} />

        {/* Intégrations */}
        <Route path="/integrations" element={<Integrations />} />

        {/* Paramètres */}
        <Route path="/setting" element={<Setting />} />

        {/* Compte */}
        <Route path="/account" element={<Account />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/security" element={<Security />} />

        {/* Erreurs */}
        <Route path="/errors" element={<Errors />} />

        {/* Feedback */}
        <Route path="/feedback" element={<Feedback />} />

        {/* Page NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
