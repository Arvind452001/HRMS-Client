import axiosInstance from "../utils/axiosInstance";

const BASE = "/resume-screening";

// Analyze a resume against a job description using AI
export const analyzeResumeApi = async (formData) => {
  try {
    const response = await axiosInstance.post(`${BASE}/analyze`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};
