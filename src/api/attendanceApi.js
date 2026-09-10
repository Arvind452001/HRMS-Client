import axiosInstance from "../utils/axiosInstance";

// Fired right after a successful check-in/check-out so other mounted
// components (e.g. the dashboard's AttendanceCalendar) can refresh
// immediately instead of waiting for a page reload or month change.
export const ATTENDANCE_UPDATED_EVENT = "attendance:updated";

// Check In

export const checkInApi = async (data) => {
  try {
    const response = await axiosInstance.post(`/employees/check-in`, data);
    window.dispatchEvent(new Event(ATTENDANCE_UPDATED_EVENT));
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// Check Out

export const checkOutApi = async (data) => {
  try {
    localStorage.removeItem("checkInTime");
    const response = await axiosInstance.post(`/employees/check-out`, data);
    window.dispatchEvent(new Event(ATTENDANCE_UPDATED_EVENT));
    return response.data;
  } catch (err) {
    throw err.response?.data || { success: false, message: err.message };
  }
};

// Get My Today Status (server truth, works on any device)

export const getMyTodayStatusApi = async () => {
  try {
    const response = await axiosInstance.get(`/employees/getTodayAttendance`);
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

// Get Employee Attendance By ID (HR/Admin view, month-scoped)
export const getEmployeeAttendanceByIdApi = async (employeeId, year, month) => {
  try {
    const response = await axiosInstance.get(
      `/admin/attendance/by-employee/${employeeId}`,
      { params: { year, month } },
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

// Get All Attendance
export const getAllAttendanceApi = async (year, month) => {
  try {
    const response = await axiosInstance.get(`/employees/attendance/my`, {
      params: {
        year,
        month,
      },
    });

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

export const getTodayALLAttendanceApi = async (date) => {
  try {
    const response = await axiosInstance.get("/employees/todayAllAttendance", {
      params: {
        date,
      },
    });

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

// Update Employee Attendance (HR manual edit)
// Lets HR create/correct a single day's attendance (status, check-in,
// check-out) for an employee from the attendance calendar popup.
export const updateEmployeeAttendanceApi = async (employeeId, payload) => {
  try {
    const response = await axiosInstance.put(
      `/admin/attendance/employee/${employeeId}`,
      payload,
    );
    window.dispatchEvent(new Event(ATTENDANCE_UPDATED_EVENT));
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

// Get Employee Attendance

export const getAttendanceSummaryApi = async (employeeId, month, year) => {
  try {
    const response = await axiosInstance.get(
      `/employees/attendance/summary?employeeId=${employeeId}&month=${month}&year=${year}`,
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
