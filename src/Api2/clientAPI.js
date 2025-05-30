import axios from "axios";
const API_URL = "http://localhost:5000/api/clients";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchClients = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await axios.post(API_URL, clientData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      clientData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

export const fetchClientCount = async () => {
  try {
    const res = await axios.get(`${API_URL}/count`, getAuthHeaders());
    return res.data.count;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération du nombre de clients :",
      err.message
    );
    throw err;
  }
};
