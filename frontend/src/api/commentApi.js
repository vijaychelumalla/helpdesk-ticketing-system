import axiosClient from "./axiosClient";

export const commentApi = {
  getCommentsByTicket: (ticketId) => axiosClient.get(`/api/comments/${ticketId}`),
  addComment: (data) => axiosClient.post("/api/comments", data), // { ticketId, message, isInternal }
};

export default commentApi;
