import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export default function NoResults({
    message,
    actions,
}: {
    message: string;
    actions: React.ReactNode;
}) {
    return (
        <Card sx={{ p: { xs: 0, sm: 1 } }}>
            <CardContent>
                <Stack
                    gap={3}
                    direction="row"
                    justifyContent="space-between"
                >
                    <Stack gap={1}>
                        <Typography
                            display="flex"
                            fontSize="large"
                            alignItems="center"
                        >
                            No results
                        </Typography>
                        <Typography color="text.secondary">
                            {message}
                        </Typography>
                    </Stack>
                    <SearchOffIcon sx={{
                        fontSize: 35,
                        color: "text.secondary",
                    }} />
                </Stack>
            </CardContent>
            <CardActions>
                {actions}
            </CardActions>
        </Card>
    );
}
