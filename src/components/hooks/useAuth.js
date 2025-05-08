// src/hooks/useAuth.js
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
};

export default useAuth;
