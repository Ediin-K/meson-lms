
import { Navigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext.js";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, roles } = useAppPreferences();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // A user may hold several roles at once; any match grants access, regardless
    // of which "hat" is currently active in the header.
    if (requiredRole && !roles.includes(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};

export default ProtectedRoute;
