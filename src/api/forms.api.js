import api from "./client";

export const getKnownChassis = async (params) => {
  const response = await api.get("/admin/forms/chassis", { params });
  return response.data;
};

export const getForm22 = async (params) => {
  const response = await api.get("/admin/forms/form22", { params });
  return response.data;
};
