import api from "./client";

export const getWorkers = async (params) => {
  const response = await api.get("/admin/workers", { params });
  return response.data;
};

export const getWorkerById = async (id) => {
  const response = await api.get(`/admin/workers/${id}`);
  return response.data;
};

export const createWorker = async (payload) => {
  const response = await api.post("/admin/workers", payload);
  return response.data;
};

export const updateWorker = async (id, payload) => {
  const response = await api.put(`/admin/workers/${id}`, payload);
  return response.data;
};

export const deleteWorker = async (id) => {
  const response = await api.delete(`/admin/workers/${id}`);
  return response.data;
};
