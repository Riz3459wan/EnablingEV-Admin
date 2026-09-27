import api from "./client";

export const getInventory = async (params) => {
  const response = await api.get("/admin/inventory", { params });
  return response.data;
};

export const getInventorySummary = async () => {
  const response = await api.get("/admin/inventory/summary");
  return response.data;
};

export const getInventoryById = async (id) => {
  const response = await api.get(`/admin/inventory/${id}`);
  return response.data;
};

export const getInventoryBreakdown = async (params) => {
  const response = await api.get("/admin/inventory/breakdown", { params });
  return response.data;
};

export const createInventory = async (payload) => {
  const response = await api.post("/admin/inventory", payload);
  return response.data;
};

export const updateInventory = async (id, payload) => {
  const response = await api.put(`/admin/inventory/${id}`, payload);
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await api.delete(`/admin/inventory/${id}`);
  return response.data;
};
