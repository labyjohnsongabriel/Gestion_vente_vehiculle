import React from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types"; // Ajout de l'import manquant
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/context/ThemeContext";
import { SidebarProvider } from "./components/context/SidebarContext";
import { UserProvider } from "./components/context/UserContext";
import { AuthProvider } from "./components/context/AuthContext";

// Création de la racine React
const root = ReactDOM.createRoot(document.getElementById("root"));

// Composant Providers qui encapsule tous les contextes
const AppProviders = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
