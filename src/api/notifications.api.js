import api from "./client";

export const getNotifications = async (params) => {
  const response = await api.get("/admin/notifications", { params });
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/admin/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/admin/notifications/read-all");
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/admin/notifications/${id}`);
  return response.data;
};

export const clearAllNotifications = async () => {
  const response = await api.delete("/admin/notifications");
  return response.data;
};
