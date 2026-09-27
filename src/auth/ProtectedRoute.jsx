import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";
import { ROLE_LOGIN } from "./roleConfig";

const ProtectedRoute = ({ allow, children }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || !allow.includes(role)) {
    return <Navigate to={ROLE_LOGIN[allow[0]] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
