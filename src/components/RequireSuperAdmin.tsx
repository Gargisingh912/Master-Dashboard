import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

const RequireSuperAdmin: React.FC = () => {
  const { role, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireSuperAdmin;