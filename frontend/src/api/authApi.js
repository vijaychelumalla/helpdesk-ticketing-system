import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => axiosClient.post("/api/auth/login", credentials),
  register: (userData) => axiosClient.post("/api/auth/register", userData),
  getMe: () => axiosClient.get("/api/auth/me"),
  forgotPassword: (email) => axiosClient.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password) => axiosClient.post(`/api/auth/reset-password/${token}`, { password }),
};

export default authApi;
