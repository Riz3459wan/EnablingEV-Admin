import api from "./client";

export const getDispatches = async (params) => {
  const response = await api.get("/admin/dispatch", { params });
  return response.data;
};

export const getDispatchById = async (id) => {
  const response = await api.get(`/admin/dispatch/${id}`);
  return response.data;
};

export const createDispatch = async (payload) => {
  const response = await api.post("/admin/dispatch", payload);
  return response.data;
};

export const updateDispatch = async (id, payload) => {
  const response = await api.put(`/admin/dispatch/${id}`, payload);
  return response.data;
};

export const deleteDispatch = async (id) => {
  const response = await api.delete(`/admin/dispatch/${id}`);
  return response.data;
};
