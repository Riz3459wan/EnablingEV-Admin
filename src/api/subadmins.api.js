import api from "./client";

export const getSubAdmins = async (params) => {
  const response = await api.get("/admin/subadmins", { params });
  return response.data;
};

export const getSubAdminById = async (id) => {
  const response = await api.get(`/admin/subadmins/${id}`);
  return response.data;
};

export const createSubAdmin = async (payload) => {
  const response = await api.post("/admin/subadmins", payload);
  return response.data;
};

export const updateSubAdmin = async (id, payload) => {
  const response = await api.put(`/admin/subadmins/${id}`, payload);
  return response.data;
};

export const deleteSubAdmin = async (id) => {
  const response = await api.delete(`/admin/subadmins/${id}`);
  return response.data;
};
