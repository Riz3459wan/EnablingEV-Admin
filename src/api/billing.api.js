import api from "./client";

export const getBillingPersons = async (params) => {
  const response = await api.get("/admin/billing-persons", { params });
  return response.data;
};

export const getBillingPersonById = async (id) => {
  const response = await api.get(`/admin/billing-persons/${id}`);
  return response.data;
};

export const createBillingPerson = async (payload) => {
  const response = await api.post("/admin/billing-persons", payload);
  return response.data;
};

export const updateBillingPerson = async (id, payload) => {
  const response = await api.put(`/admin/billing-persons/${id}`, payload);
  return response.data;
};

export const deleteBillingPerson = async (id) => {
  const response = await api.delete(`/admin/billing-persons/${id}`);
  return response.data;
};
