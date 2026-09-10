import axiosInstance from "../utils/axiosInstance";

export const createVisitorApi = async (data) => {
  try {
    const response = await axiosInstance.post("/visitor/create", data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getALLVisitorApi = async () => {
  try {
    const response = await axiosInstance.get("/visitor/getAllVisitor");
    return response.data.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getVisitorById = async (id) => {
  try {
    const response = await axiosInstance.get(`visitor/getVisitorById/${id}`);
    
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const updateVisitorStatusApi = async (id, data) => {
 try {
    const response = await axiosInstance.patch(
      `/visitor/updateStatus/${id}/status`,
      data
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

