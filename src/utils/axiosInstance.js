import axios from "axios";
import Swal from "sweetalert2";
import { baseURL } from "./baseUrlConfig";
import { PRIMARY_COLOR, showError } from "./alert";

// Axios Instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token
    const token = localStorage.getItem("technoToken");

    // Attach token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    // Handle Maintenance Mode — Admin never sees this (server already lets
    // Admin through), so any non-admin user hitting a locked-out endpoint
    // gets sent straight to the maintenance screen.
    if (status === 503 && error.response?.data?.maintenance) {
      if (window.location.pathname !== "/maintenance") {
        window.location.href = "/maintenance";
      }
      return Promise.reject(error);
    }

    // Handle Unauthorized Error
    if (status === 401 && !error.config?.url?.includes("/login")) {
      // Remove stored data
      localStorage.removeItem("technoToken");
      localStorage.removeItem("technoUser");

      // Show alert
      await Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again",
        confirmButtonText: "OK",
        confirmButtonColor: PRIMARY_COLOR,
        allowOutsideClick: false,
      });

      // Redirect to login
      window.location.href = "/login";
    }

    // Handle Server Error
    if (status === 500) {
      showError("Server Error", "Something went wrong on server");
    }

    // Handle Network Error
    if (!error.response) {
      showError(
        "Network Error",
        "Please check your internet connection/ login again"
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;