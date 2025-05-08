import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Assurez-vous que cette URL correspond à votre backend
});

// Intercepteur pour ajouter le token JWT dans les en-têtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("❌ Aucun token valide trouvé dans localStorage");
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Erreur d'authentification : Token expiré ou invalide");
      localStorage.removeItem("authToken");
      window.location.href = "/login"; // Redirige vers la page de connexion
    }
    return Promise.reject(error);
  }
);

export default api;
