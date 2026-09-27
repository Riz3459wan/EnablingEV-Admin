import { createContext, useContext, useMemo } from "react";
import {
  useNotificationsQuery,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "../hooks/useNotifications";

const NotificationContext = createContext(null);

const toArray = (v) => (Array.isArray(v) ? v : []);

export const NotificationProvider = ({ children }) => {
  const { data, loading, error, reload } = useNotificationsQuery();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  const notifications = useMemo(() => toArray(data), [data]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const highPriorityCount = useMemo(
    () => notifications.filter((n) => !n.read && n.priority === "high").length,
    [notifications],
  );

  const markAsRead = (id) => {
    markReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const clearAll = () => {
    clearAllMutation.mutate();
  };

  const removeNotification = (id) => {
    deleteMutation.mutate(id);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      highPriorityCount,
      markAsRead,
      markAllAsRead,
      clearAll,
      removeNotification,
      loading,
      error,
      reload,
    }),
    [
      notifications,
      unreadCount,
      highPriorityCount,
      markReadMutation,
      markAllReadMutation,
      deleteMutation,
      clearAllMutation,
      loading,
      error,
      reload,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return ctx;
};
