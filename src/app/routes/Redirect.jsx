// src/routes/Redirect.jsx
import { Navigate } from "react-router-dom";
import { getLandingRoute } from "../../utils/roleAccess";

const Redirect = () => {
  const storedUser = localStorage.getItem("technoUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // No user → Login Page
  if (!user) {
    return <Navigate to="/visitorPage" replace />;
  }

  // Role based redirect — user.roles is an array (e.g. ["hr","employee"])
  return <Navigate to={getLandingRoute(user.roles)} replace />;
};

export default Redirect;
