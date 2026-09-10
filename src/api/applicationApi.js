import axiosInstance from "../utils/axiosInstance";
import { publicAxios } from "../utils/publicAxiosInstance";

export const applyJobApi = async (jobId, data) => {
  try {
    const response = await publicAxios.post(
      `/applications/apply/${jobId}`,
      data,
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getAllApplicationsApi = async ({
  page = 1,
  limit = 10,
  status = "All",
}) => {
  try {
    const response = await axiosInstance.get(
      `/applications/getAllApplications?page=${page}&limit=${limit}&status=${status}`
    );

    return response.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: err.message,
      }
    );
  }
};

export const getApplicationsByIDApi = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/applications/getApplication/${id}`
    );

    return response.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: err.message,
      }
    );
  }
};
// Update Application Status

export const updateApplicationStatusApi = async (id, data) => {
  try {
    const response = await axiosInstance.patch(
      `/applications/updateStatus/${id}/status`,
      data
    );

    return response.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: err.message,
      }
    );
  }
};