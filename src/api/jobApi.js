import axiosInstance from "../utils/axiosInstance";
import { publicAxios } from "../utils/publicAxiosInstance";

export const createJobApi = async (data) => {
  try {
    const response = await axiosInstance.post("/jobs/createJobs", data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getAllJobApi = async ({
  page = 1,
  limit = 10,
  status = "Published",
}) => {
  try {
    const response = await axiosInstance.get(
      `/jobs/getAllJobs?page=${page}&limit=${limit}&status=${status}`
    );
 
    return response.data; // return full response
  } catch (err) {
    throw err.response?.data || {
      success: false,
      message: err.message,
    };
  }
};

export const getJobById = async (id) => {
  try {
    const response = await axiosInstance.get(`job/getJobById/${id}`);
    
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getJobBySlug = async (id) => {
  try {
    const response = await publicAxios.get(`/jobs/public/${id}`);
    
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const updateJobApi = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/jobs/update/${id}`, data);
    
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const deleteJobApi = async (jobId) => {
  try {
    const response = await axiosInstance.delete(`/jobs/delete/${jobId}`);
     // Debugging log
    return response;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};