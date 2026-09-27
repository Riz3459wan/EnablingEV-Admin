import api from "./client";

export const getCustomers = async (params) => {
  const response = await api.get("/admin/customers", { params });
  return response.data;
};

export const getCustomersAdmin = async (params) => {
  const response = await api.get("/CustomerTable/admin", { params });
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data;
};

export const createCustomer = async (payload) => {
  const response = await api.post("/admin/customers", payload);
  return response.data;
};

export const updateCustomer = async (id, payload) => {
  const response = await api.put(`/admin/customers/${id}`, payload);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/admin/customers/${id}`);
  return response.data;
};
