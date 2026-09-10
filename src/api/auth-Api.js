import axiosInstance from "../utils/axiosInstance";

export const createEmployeeApi = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

export const loginApi = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Visitor API
export const getProfileApi = async () => {
  try {
    const token = localStorage.getItem("technoToken");

    const response = await axiosInstance.get("/auth/my-profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

//=`=================Visitor API=============//
export const createVisitorApi = async (data) => {
  try {
    const response = await axiosInstance.post("/visitor/create", data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};