import api from "./client";

export const getQuotations = async (params) => {
  const response = await api.get("/admin/quotations", { params });
  return response.data;
};

export const getQuotationsFromTable = async (params) => {
  const response = await api.get("/QuotationTable", { params });
  return response.data;
};

export const getQuotationById = async (id) => {
  const response = await api.get(`/admin/quotations/${id}`);
  return response.data;
};

export const createQuotation = async (payload) => {
  const response = await api.post("/QuotationTable", payload);
  return response.data;
};

export const updateQuotation = async (id, payload) => {
  const response = await api.put(`/QuotationTable/${id}`, payload);
  return response.data;
};

export const deleteQuotation = async (id) => {
  const response = await api.delete(`/QuotationTable/${id}`);
  return response.data;
};
