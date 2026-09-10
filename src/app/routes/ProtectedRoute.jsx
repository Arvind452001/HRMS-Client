import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowed }) {
  const user = JSON.parse(localStorage.getItem("technoUser"));
  const accessToken = localStorage.getItem("technoToken"); 
  // not logged in
  if (!accessToken || !user) {
   return <Navigate to="/visitorPage" replace />;
    
  }

  // multi-role check — user.roles is an array (e.g. ["hr","employee"]).
  // A route is accessible if the user holds AT LEAST ONE of the allowed roles.
  const userRoles = user.roles || [];
  const isAllowed = !allowed || allowed.some((role) => userRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/visitorPage" replace />;
  }

  return <Outlet />;
}
