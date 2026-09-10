import { Navigate, Outlet } from "react-router-dom"
import { getLandingRoute } from "../../utils/roleAccess"

export default function PublicRoute() {
  const accessToken = localStorage.getItem("technoToken");
  const user = JSON.parse(localStorage.getItem("technoUser") || "{}");

  // already logged in → redirect by role
  if (accessToken && user?.roles) {
    return <Navigate to={getLandingRoute(user.roles)} replace />
  }

  return <Outlet />
}
