import api from "./client";

export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getDashboardVehicles = async () => {
  const response = await api.get("/dashboard/vehicles");
  return response.data;
};

export const getDashboardDealers = async () => {
  const response = await api.get("/dashboard/dealers");
  return response.data;
};

export const getDashboardSales = async () => {
  const response = await api.get("/dashboard/sales");
  return response.data;
};
