import axiosInstance from "./axiosInstance";

export const getNotifications = async () => {
  const { data } = await axiosInstance.get("/notifications");
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await axiosInstance.get("/notifications/unread-count");
  return data;
};

export const markAsRead = async (id) => {
  await axiosInstance.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  await axiosInstance.patch("/notifications/read-all");
};
