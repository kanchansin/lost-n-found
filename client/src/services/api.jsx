import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const itemsAPI = {
  // Get all items with optional filters
  getItems: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/items?${params.toString()}`);
  },

  // Get single item by ID
  getItem: (id) => api.get(`/items/${id}`),

  // Get single item by unique ID
  getItemByUniqueId: (uniqueId) => api.get(`/items/by-unique-id/${uniqueId}`),

  // Create new item
  createItem: (formData) => api.post('/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Mark item as claimed
  claimItem: (id) => api.put(`/items/${id}/claim`),

  // Get categories
  getCategories: () => api.get('/categories'),
};

export default api;