import axiosClient from "./axiosClient";

export const userApi = {
  getUsers: (params = {}) => axiosClient.get("/api/users", { params }),
  getUserById: (id) => axiosClient.get(`/api/users/${id}`),
  createUser: (userData) => axiosClient.post("/api/users", userData),
  updateUser: (id, updates) => axiosClient.patch(`/api/users/${id}`, updates),
  deleteUser: (id) => axiosClient.delete(`/api/users/${id}`),
};

export default userApi;
