import api from "./client";

export const getVehicles = async (params) => {
  const response = await api.get("/admin/vehicles", { params });
  return response.data;
};

export const getVehicleTable = async (params) => {
  const response = await api.get("/VehicleTable", { params });
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await api.get(`/admin/vehicles/${id}`);
  return response.data;
};

export const getDealerVehicleSummary = async () => {
  const response = await api.get("/admin/vehicles/dealer-summary");
  return response.data;
};

export const createVehicle = async (payload) => {
  const response = await api.post("/admin/vehicles", payload);
  return response.data;
};

export const updateVehicle = async (id, payload) => {
  const response = await api.put(`/admin/vehicles/${id}`, payload);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/admin/vehicles/${id}`);
  return response.data;
};
