import { useState } from "react";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import CodeIcon from "@mui/icons-material/Code";
import NotesIcon from "@mui/icons-material/Notes";
import { RiFileExcel2Fill } from "react-icons/ri";
import { BsFileSpreadsheetFill } from "react-icons/bs";
import { Transcription, downloadTranscript } from "../models/Transcription";

export default function TranscriptDownloadMenu({
    transcription,
    disabled,
    asButton,
}: {
    transcription: Transcription;
    disabled?: boolean;
    asButton?: boolean;
}) {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorElement(null);
    }

    const downloadText = () => downloadTranscript(transcription, "text")
    const downloadJSON = () => downloadTranscript(transcription, "json")
    const downloadCSV = () => downloadTranscript(transcription, "csv")
    const downloadXLSX = () => downloadTranscript(transcription, "xlsx");

    return (
        <>
            {asButton ?
                <Button
                    color="primary"
                    title="Download"
                    disabled={disabled}
                    onClick={handleOpen}
                    startIcon={<DownloadIcon />}
                >
                    Download
                </Button> :
                <IconButton
                    color="primary"
                    title="Download"
                    disabled={disabled}
                    onClick={handleOpen}
                >
                    <DownloadIcon />
                </IconButton>
            }
            <Menu
                open={!!anchorElement}
                anchorEl={anchorElement}
                onClick={handleClose}
                onClose={handleClose}
            >
                <MenuItem onClick={downloadText}>
                    <ListItemIcon>
                        <NotesIcon />
                    </ListItemIcon>
                    <ListItemText>
                        Text
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={downloadJSON}>
                    <ListItemIcon>
                        <CodeIcon />
                    </ListItemIcon>
                    <ListItemText>
                        JSON
                    </ListItemText>
                </MenuItem>
                {transcription.identify_speakers &&
                    <Box>
                        <Divider />
                        <Typography
                            my={1}
                            mx={2}
                            color="text.secondary"
                        >
                            Speaker segments
                        </Typography>
                        <MenuItem onClick={downloadCSV}>
                            <ListItemIcon>
                                <BsFileSpreadsheetFill size={20} />
                            </ListItemIcon>
                            <ListItemText>
                                CSV
                            </ListItemText>
                        </MenuItem>
                        <MenuItem onClick={downloadXLSX}>
                            <ListItemIcon>
                                <RiFileExcel2Fill size={22} />
                            </ListItemIcon>
                            <ListItemText>
                                Excel
                            </ListItemText>
                        </MenuItem>
                    </Box>
                }
            </Menu>
        </>
    );
}