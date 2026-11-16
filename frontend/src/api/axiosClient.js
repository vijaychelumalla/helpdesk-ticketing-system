import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("helpdesk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors and session expiration
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 401 Unauthorized - token expired or invalid
      if (error.response.status === 401 && !error.config.url.includes("/login")) {
        localStorage.removeItem("helpdesk_token");
        localStorage.removeItem("helpdesk_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
      }
      return Promise.reject(error.response.data || { message: error.message });
    }
    return Promise.reject({ message: "Network error. Please check backend server connection." });
  }
);

export default axiosClient;
