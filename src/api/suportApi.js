import axiosInstance from "../utils/axiosInstance";

// Create Support Ticket
export const createSupportApi = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/support/create",
      data
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};


// Get All Support Tickets
export const getAllSupportApi = async () => {
  try {
    const response = await axiosInstance.get(
      "/support/get"
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};