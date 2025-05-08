import React, { createContext, useContext, useState, useEffect } from "react";

// Créer le contexte
const AuthContext = createContext();

// Créer le fournisseur d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/profile", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!res.ok) {
            throw new Error("Problème de récupération du profil");
          }
  
          const data = await res.json();
          setUser(data);
        } catch (err) {
          console.error("Erreur d'authentification:", err);
          logout();
        }
      }
      setLoading(false);
    };
  
    checkAuth();
  }, [token]);
  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Erreur lors de l'inscription",
        };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Erreur lors de la connexion",
        };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte
export const useAuth = () => useContext(AuthContext);
