import api from "./client";

// ── READ ──
export const getOrders = async (params) => {
  const response = await api.get("/admin/orders", { params });
  return response.data;
};

export const getOrdersFromQuotationTable = async (params) => {
  const response = await api.get("/QuotationTable", { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

// ── CREATE / UPDATE / DELETE ──
export const createOrder = async (payload) => {
  const response = await api.post("/admin/orders", payload);
  return response.data;
};

export const updateOrder = async (id, payload) => {
  const response = await api.put(`/admin/orders/${id}`, payload);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/admin/orders/${id}`);
  return response.data;
};

// ── ADMIN WORKFLOW ACTIONS (client flow) ──
export const approveOrder = async (id) => {
  const response = await api.put(`/admin/orders/${id}/approve`);
  return response.data;
};

export const rejectOrder = async (id, payload) => {
  const response = await api.put(`/admin/orders/${id}/reject`, payload);
  return response.data;
};

export const moveToBilling = async (id) => {
  const response = await api.put(`/admin/orders/${id}/move-to-billing`);
  return response.data;
};

export const markBilled = async (id, payload) => {
  const response = await api.put(`/admin/orders/${id}/bill`, payload);
  return response.data;
};

export const moveToDispatch = async (id) => {
  const response = await api.put(`/admin/orders/${id}/move-to-dispatch`);
  return response.data;
};

export const dispatchOrder = async (id, payload) => {
  const response = await api.put(`/admin/orders/${id}/dispatch`, payload);
  return response.data;
};

export const markOrderDelivered = async (id) => {
  const response = await api.put(`/admin/orders/${id}/deliver`);
  return response.data;
};
