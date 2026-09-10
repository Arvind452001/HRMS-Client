import axiosInstance from "../utils/axiosInstance";

const BASE = "/candidate-resumes";

// Category -> Sub-category (domain) master list for the add-candidate form
export const getCandidateResumeCategoriesApi = async () => {
  try {
    const response = await axiosInstance.get(`${BASE}/categories`);
    return response.data.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// CREATE — expects a FormData instance (basic details + resume file)
export const createCandidateResumeApi = async (formData) => {
  try {
    const response = await axiosInstance.post(`${BASE}/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// UPDATE — expects a FormData instance (basic details, resume file optional)
export const updateCandidateResumeApi = async (id, formData) => {
  try {
    const response = await axiosInstance.patch(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// LIST — filters: { category, status, search, page, limit }
export const getCandidateResumesApi = async (filters = {}) => {
  try {
    const response = await axiosInstance.get(BASE, { params: filters });
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const getCandidateResumeByIdApi = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const updateCandidateResumeStatusApi = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`${BASE}/${id}/status`, {
      status,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// DELETE — once the interview process is complete, purge candidate data
// (also removes the resume from Cloudinary on the server side)
export const deleteCandidateResumeApi = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE}/${id}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};
