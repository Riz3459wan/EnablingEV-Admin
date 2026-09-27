import api from "./client";

export const login = async (payload) => {
  const response = await api.post("/admin/login", payload);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/admin/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/admin/me");
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.post("/admin/change-password", payload);
  return response.data;
};
