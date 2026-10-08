import axiosInstance from "../utils/axiosInstance";

const handle = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      throw (
        err.response?.data || {
          success: false,
          message: err.message,
        }
      );
    });

// DASHBOARD

export const getAdminDashboardSummaryApi = () =>
  handle(axiosInstance.get("/admin-panel/dashboard/summary"));

export const getAdminAuditSummaryApi = () =>
  handle(axiosInstance.get("/admin-panel/audit-summary"));

// USER & ROLE MANAGEMENT

export const getAllUsersApi = (params) =>
  handle(axiosInstance.get("/admin-panel/users", { params }));

export const getUserByIdApi = (id) =>
  handle(axiosInstance.get(`/admin-panel/users/${id}`));

export const createStaffUserApi = (data) =>
  handle(axiosInstance.post("/admin-panel/users", data));

export const updateUserRolesApi = (id, roles) =>
  handle(axiosInstance.patch(`/admin-panel/users/${id}/roles`, { roles }));

export const toggleUserStatusApi = (id) =>
  handle(axiosInstance.patch(`/admin-panel/users/${id}/status`));

export const adminResetPasswordApi = (id, newPassword) =>
  handle(
    axiosInstance.patch(`/admin-panel/users/${id}/reset-password`, {
      newPassword,
    }),
  );

export const deleteUserApi = (id) =>
  handle(axiosInstance.delete(`/admin-panel/users/${id}`));

// DEPARTMENTS

export const getDepartmentsApi = (params) =>
  handle(axiosInstance.get("/admin-panel/departments", { params }));

export const createDepartmentApi = (data) =>
  handle(axiosInstance.post("/admin-panel/departments", data));

export const updateDepartmentApi = (id, data) =>
  handle(axiosInstance.put(`/admin-panel/departments/${id}`, data));

export const deleteDepartmentApi = (id) =>
  handle(axiosInstance.delete(`/admin-panel/departments/${id}`));

// DESIGNATIONS

export const getDesignationsApi = (params) =>
  handle(axiosInstance.get("/admin-panel/designations", { params }));

export const createDesignationApi = (data) =>
  handle(axiosInstance.post("/admin-panel/designations", data));

export const updateDesignationApi = (id, data) =>
  handle(axiosInstance.put(`/admin-panel/designations/${id}`, data));

export const deleteDesignationApi = (id) =>
  handle(axiosInstance.delete(`/admin-panel/designations/${id}`));

// SYSTEM SETTINGS

export const getSystemSettingsApi = () =>
  handle(axiosInstance.get("/admin-panel/settings"));

export const updateSystemSettingsApi = (data) =>
  handle(axiosInstance.put("/admin-panel/settings", data));

// AUDIT LOGS (existing endpoint, reused by the Admin Panel)

export const getAuditLogsApi = (params) =>
  handle(axiosInstance.get("/audit-logs", { params }));

export const getAuditStatsApi = () =>
  handle(axiosInstance.get("/audit-logs/stats/summary"));

// PUBLIC SYSTEM STATUS (used by the Maintenance screen — no admin rights needed)

export const getSystemStatusApi = () =>
  handle(axiosInstance.get("/system-status"));

