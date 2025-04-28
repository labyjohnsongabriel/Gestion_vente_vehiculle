import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Base URL for your API
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
