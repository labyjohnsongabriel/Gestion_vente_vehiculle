import React from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProviderCustom } from "./components/context/ThemeContext.jsx"; // corrected import
import { SidebarProvider } from "./components/context/SidebarContext";
import { UserProvider } from "./components/context/UserContext";
import { AuthProvider } from "./components/context/AuthContext";

// Création de la racine React
const root = ReactDOM.createRoot(document.getElementById("root"));

// Composant Providers qui encapsule tous les contextes
const AppProviders = ({ children }) => (
  <BrowserRouter>
    <ThemeProviderCustom>
      <AuthProvider>
        <UserProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProviderCustom>
  </BrowserRouter>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

// Encapsulation des providers et rendu de l’application
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
