import axiosInstance from "../utils/axiosInstance";

// Get My Notifications
export const getMyNotificationsApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/notifications", { params });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Get Unread Notification Count
export const getUnreadNotificationCountApi = async () => {
  try {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Mark One Notification As Read
export const markNotificationAsReadApi = async (id) => {
  try {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Mark All Notifications As Read
export const markAllNotificationsAsReadApi = async () => {
  try {
    const response = await axiosInstance.patch("/notifications/mark-all-read");
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};
