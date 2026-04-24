import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cl_user");
      localStorage.removeItem("cl_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Posts
export const postsAPI = {
  getAll: (page = 1) => api.get(`/posts?page=${page}`),
  create: (data) => api.post("/posts", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
  }),
  like: (id) => api.put(`/posts/${id}/like`),
  comment: (id, data) => api.post(`/posts/${id}/comments`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};

// Users
export const usersAPI = {
  getAllUsers: () => api.get("/users"),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getUserPosts: (id) => api.get(`/users/${id}/posts`),
  toggleConnection: (id) => api.post(`/users/${id}/connect`),
  acceptConnection: (id) => api.post(`/users/${id}/accept`),
  rejectConnection: (id) => api.post(`/users/${id}/reject`),
  getRequests: () => api.get('/users/me/requests'),
};

export default api;