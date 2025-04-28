import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "./components/context/SidebarContext"; // Chemin corrigé
import { ThemeProvider } from "./components/context/ThemeContext"; // Chemin corrigé
import { UserProvider } from "./components/context/UserContext"; // Chemin corrigé

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SidebarProvider>
        <ThemeProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </ThemeProvider>
      </SidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
