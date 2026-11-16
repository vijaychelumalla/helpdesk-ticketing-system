import axiosClient from "./axiosClient";

export const fileApi = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  attachFileToTicket: (ticketId, file) => {
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("file", file);
    return axiosClient.post("/api/files/attach", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default fileApi;
