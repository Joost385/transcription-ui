import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";

export default function RouterLink({
    text,
    href,
}: {
    text: string;
    href: string;
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(href);
    }

    return (
        <Link
            onClick={handleClick}
            sx={{ cursor: "pointer" }}
        >
            {text}
        </Link>
    );
}