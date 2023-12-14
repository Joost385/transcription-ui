import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useQueryParam(param: string) {
    const navigate = useNavigate();
    const { search, pathname } = useLocation();

    const parameter = useMemo(
        () => new URLSearchParams(search).get(param),
        [search, param]
    );

    const clearParameter = () => {
        const searchParams = new URLSearchParams(search);
        searchParams.delete(param);
        const newSearchString = searchParams.toString();
        navigate(pathname + (newSearchString ? `?${newSearchString}` : ""));
    }

    return { parameter, clearParameter };
}
