import { useCallback } from "react";
import {
    To,
    createPath,
    resolvePath,
    useNavigate,
    useLocation,
} from "react-router-dom";

export default function useSmartNavigate() {
    const navigate = useNavigate();
    const location = useLocation();

    return useCallback((to: To) => {
        const path = resolvePath(to, location.pathname);
        const replace = createPath(location) === createPath(path);
        navigate(to, { replace });
    }, [navigate, location]);
}