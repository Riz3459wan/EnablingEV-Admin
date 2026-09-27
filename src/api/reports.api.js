import api from "./client";

export const getVehicleReports = async (params) => {
  const response = await api.get("/admin/reports/vehicles", { params });
  return response.data;
};

export const getCustomerReports = async (params) => {
  const response = await api.get("/admin/reports/customers", { params });
  return response.data;
};

export const getDealerReports = async (params) => {
  const response = await api.get("/admin/reports/dealers", { params });
  return response.data;
};
