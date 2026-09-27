import api from "./client";

export const getDeliveries = async (params) => {
  const response = await api.get("/admin/delivery", { params });
  return response.data;
};

export const getDeliveryById = async (id) => {
  const response = await api.get(`/admin/delivery/${id}`);
  return response.data;
};

export const createDelivery = async (payload) => {
  const response = await api.post("/admin/delivery", payload);
  return response.data;
};

export const updateDelivery = async (id, payload) => {
  const response = await api.put(`/admin/delivery/${id}`, payload);
  return response.data;
};

export const deleteDelivery = async (id) => {
  const response = await api.delete(`/admin/delivery/${id}`);
  return response.data;
};
