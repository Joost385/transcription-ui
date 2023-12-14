import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import HelpIcon from "@mui/icons-material/Help";
import FAQ from "./FAQ";
import Guide from "./Guide";

export default function Help() {
    return (
        <>
            <Typography component="h1" variant="h5">
                <HelpIcon sx={{
                    mr: 1.5,
                    fontSize: "inherit",
                    verticalAlign: "middle",
                }} />
                Help
            </Typography>
            <Divider sx={{ mb: 4, mt: 2 }} />
            <Stack gap={10}>
                <Guide />
                <FAQ />
            </Stack>
        </>
    );
}