import { useState, useEffect } from "react";
import Grow from "@mui/material/Grow";
import Popper, { PopperPlacementType } from "@mui/material/Popper";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { SxProps, Theme } from "@mui/material/styles";
import { Recording, getRecordingDownloadUrl } from "../models/Recording";

export default function PlayButton({
    recording,
    placement,
    autoPlay,
    controls,
    start,
    end,
    sx,
}: {
    recording: Recording;
    placement?: PopperPlacementType;
    autoPlay?: boolean;
    controls?: boolean;
    start?: number;
    end?: number;
    sx?: SxProps<Theme>
}) {
    const [url, setUrl] = useState<null | string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const handleClose = () => {
        setUrl(null);
        setAnchorElement(null);
    }

    const fetchRecordingUrl = async () => {
        setIsLoading(true);
        const url = await getRecordingDownloadUrl(recording, start, end);
        setIsLoading(false);
        setUrl(url);
    }

    useEffect(() => {
        !!anchorElement && fetchRecordingUrl();
    }, [anchorElement]);

    const isOpen = !isLoading && !!anchorElement && !!url;

    return (
        <>
            <IconButton
                onClick={handleOpen}
                disabled={isLoading}
                color="primary"
                title="Play"
                sx={sx}
            >
                {isLoading ?
                    <CircularProgress size={24} /> :
                    <PlayArrowIcon />
                }
            </IconButton>
            <Popper
                transition
                open={isOpen}
                anchorEl={anchorElement}
                placement={placement}
                sx={{ zIndex: "tooltip" }}
            >
                {({ TransitionProps }) =>
                    <ClickAwayListener onClickAway={handleClose}>
                        <Grow {...TransitionProps}>
                            <audio
                                autoPlay={autoPlay}
                                controls={controls}
                                src={url ?? undefined}
                            />
                        </Grow>
                    </ClickAwayListener>
                }
            </Popper>
        </>
    );
}
