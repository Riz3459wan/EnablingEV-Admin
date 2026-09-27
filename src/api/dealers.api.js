import api from "./client";

export const getDealers = async (params) => {
  const response = await api.get("/admin/dealers", { params });
  return response.data;
};

export const getDealersSummary = async () => {
  const response = await api.get("/admin/dealers/summary");
  return response.data;
};

export const getDealersBreakdown = async (params) => {
  const response = await api.get("/admin/dealers/breakdown", { params });
  return response.data;
};

export const getDealerById = async (id) => {
  const response = await api.get(`/admin/dealers/${id}`);
  return response.data;
};

export const createDealer = async (payload) => {
  const response = await api.post("/admin/dealers", payload);
  return response.data;
};

export const updateDealer = async (id, payload) => {
  const response = await api.put(`/admin/dealers/${id}`, payload);
  return response.data;
};

export const deleteDealer = async (id) => {
  const response = await api.delete(`/admin/dealers/${id}`);
  return response.data;
};

export const getDealerFull = async () => {
  const response = await api.get("/dealer/full");
  return response.data;
};

export const getDealerDetails = async (id) => {
  const response = await api.get(`/admin/dealers/${id}/details`);
  return response.data;
};

export const getPendingDealerRequests = async () => {
  const response = await api.get("/dealer/pending");
  return response.data;
};

export const approveDealerRequest = async (id) => {
  const response = await api.post(`/dealer/approve/${id}`);
  return response.data;
};

export const rejectDealerRequest = async (id, payload) => {
  const response = await api.post(`/dealer/reject/${id}`, payload);
  return response.data;
};
