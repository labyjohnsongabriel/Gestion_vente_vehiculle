import axios from "axios";

const API_URL = "http://localhost:5000/api/categories"; // Changer l'URL ici

// Fonction pour récupérer toutes les catégories
export const fetchCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Fonction pour créer une nouvelle catégorie
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Fonction pour mettre à jour une catégorie existante
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Fonction pour supprimer une catégorie
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
