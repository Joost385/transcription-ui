import { useState } from "react";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useNotificationStore from "../state/useNotificationStore";

export default function CopyButton({
    text,
    content,
}: {
    text: string,
    content: string,
}) {
    const [copied, setCopied] = useState(false);
    const notify = useNotificationStore(state => state.handleOpen);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch {
            notify({
                title: "Error",
                message: "Could not copy to clipboard.",
            })
        }
    };

    return (
        <Button
            onClick={handleCopy}
            startIcon={
                copied ?
                    <CheckIcon /> :
                    <ContentCopyIcon />
            }
        >
            {text}
        </Button>
    );
}
