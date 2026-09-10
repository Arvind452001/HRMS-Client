import axiosInstance from "../utils/axiosInstance";

// Apply Leave
export const applyLeaveApi = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/leave/apply-leave",
      data
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Get My Leaves
export const getMyLeavesApi = async () => {
  try {
    const response = await axiosInstance.get(
      "/leave/get-my-leaves"
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Cancel Leave
export const cancelLeaveApi = async (leaveId) => {
  try {
    const response = await axiosInstance.patch(
      `/leave/cancel-leave/${leaveId}`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};


// Get All Leaves (HR)
export const getAllLeaveApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/leaves/pending", {
      params,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};


// Get a single employee's leaves (HR view — used by the per-employee
// attendance calendar/summary). Optional month/year narrows the result.
export const getEmployeeLeavesApi = async (employeeId, year, month) => {
  try {
    const response = await axiosInstance.get(
      `/admin/leaves/employee/${employeeId}`,
      { params: { year, month } }
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const updateLeaveStatusApi = async (leaveId, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/leaves/${leaveId}/status`,
      payload
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// HR full edit of a leave entry (leave type, day mode, status, reason) —
// used by the attendance calendar popup's "Edit" action on a leave day.
export const updateLeaveDetailsApi = async (leaveId, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/leaves/${leaveId}`,
      payload
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// HR create a leave directly for an employee (leave type, day mode,
// status, reason) — used by the attendance calendar popup's "+ Add Leave"
// tab when the clicked date has no existing leave yet.
export const createLeaveForEmployeeApi = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/admin/leaves",
      payload
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// HR remove a leave entirely (the "No record" equivalent for leaves) —
// used by the attendance calendar popup's "Remove Leave" action.
export const deleteLeaveApi = async (leaveId) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/leaves/${leaveId}`
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};