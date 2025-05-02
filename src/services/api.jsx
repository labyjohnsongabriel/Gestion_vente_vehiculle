import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getCategories = () => api.get("/categories");
export const createCategory = (category) => api.post("/categories", category);
export const updateCategory = (id, category) =>
  api.put(`/categories/${id}`, category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export default api;
