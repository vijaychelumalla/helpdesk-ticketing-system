import axiosClient from "./axiosClient";

export const ticketApi = {
  getTickets: (params = {}) => axiosClient.get("/api/tickets", { params }),
  getTicketById: (id) => axiosClient.get(`/api/tickets/${id}`),
  createTicket: (ticketData) => axiosClient.post("/api/tickets", ticketData),
  updateTicketStatus: (id, status) => axiosClient.patch(`/api/tickets/${id}/status`, { status }),
  assignTicket: (id, agentId) => axiosClient.patch(`/api/tickets/${id}/assign`, { agentId }),
  deleteTicket: (id) => axiosClient.delete(`/api/tickets/${id}`),
};

export default ticketApi;
