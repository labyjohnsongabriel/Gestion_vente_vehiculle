import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const fetchCommandes = () => api.get("/commandes");
export const fetchCommandeById = (id) => api.get(`/commandes/${id}`);
export const createCommande = (data) => api.post("/commandes", data);
export const updateCommande = (id, data) => api.put(`/commandes/${id}`, data);
export const deleteCommande = (id) => api.delete(`/commandes/${id}`);

export const fetchClients = () => api.get("/clients");
export const fetchUsers = () => api.get("/users");

// Exportez l'instance axios pour les cas particuliers
export default api;
