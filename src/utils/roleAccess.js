// Single source of truth for "where should this user land" based on their
// roles array (technoUser.roles). Both HR and Admin land on the HR
// dashboard (Admin has access to all three sides; HR can switch to the
// Employee view from there via the toggle). A user with only the
// "employee" role lands on the Employee dashboard.
export const getLandingRoute = (roles = []) => {
  if (roles.includes("hr") || roles.includes("admin")) {
    return "/hr/dashboard";
  }

  if (roles.includes("employee")) {
    return "/employee/dashboard";
  }

  return "/visitorPage";
};
