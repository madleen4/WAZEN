import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  // Check JWT token 
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;