import axiosClient from "./axiosClient";

export const activityApi = {
  getTicketActivities: (ticketId) => axiosClient.get(`/api/activities/${ticketId}`),
};

export default activityApi;
