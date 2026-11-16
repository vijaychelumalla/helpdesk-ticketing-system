import axiosClient from "./axiosClient";

export const dashboardApi = {
  getDashboardStats: () => axiosClient.get("/api/dashboard/stats"),
};

export default dashboardApi;
