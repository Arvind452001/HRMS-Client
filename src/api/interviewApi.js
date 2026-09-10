import axiosInstance from "../utils/axiosInstance";

export const scheduleInterviewApi = async (data) => {
  const response = await axiosInstance.post("/Interview/schedule", data);
  return response.data;
};

export const getCandidateInterviewsApi = async (id) => {
  const response = await axiosInstance.get(`/Interview/candidate/${id}`);
  return response.data;
};

export const getEmployeeInterviewsApi = async (id) => {
  const response = await axiosInstance.get(`/Interview/interviewer/${id}`);
  return response.data;
};

export const submitInterviewReviewApi = async (id, data) => {
  const response = await axiosInstance.put(`/Interview/${id}/review`, data);
  return response.data;
};
