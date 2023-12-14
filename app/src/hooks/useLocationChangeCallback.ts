import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useLocationChangeCallback(callback: () => void) {
    const location = useLocation();

    useEffect(() => {
        callback();
    }, [location]);
}