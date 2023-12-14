import { useState } from "react";
import { useForm, TextFieldElement } from "react-hook-form-mui";
import { SxProps, Theme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import CircularProgress from "@mui/material/CircularProgress";
import useNotificationStore from "../../state/useNotificationStore";
import { isValidEmail } from "../../utils/validation";
import { apiFetch } from "../../utils/api";

export default function PasswordResetButton({ sx }: { sx?: SxProps<Theme> }) {
    const notify = useNotificationStore(state => state.handleOpen)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const {
        control,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<{ email: string }>();

    const onSubmit = handleSubmit(
        async ({ email }) => {
            // TODO display many request error
            await apiFetch(`security/password_reset/${email}`);
            handleClose();
            notify({
                title: "Request received",
                message: `If ${email} is an active registered account, an email with instructions will be sent.`,
            });
        }
    );

    return (
        <>
            <Button
                size="small"
                color="primary"
                sx={{ textTransform: "none", ...sx }}
                onClick={handleOpen}
            >
                Reset Password
            </Button>
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                <form onSubmit={onSubmit}>
                    <Stack
                        p={1}
                        gap={1}
                        width={300}
                        maxWidth="calc(100vw - 32px)"
                    >
                        <TextFieldElement
                            required
                            size="small"
                            name="email"
                            placeholder="Email"
                            control={control}
                            disabled={isSubmitting}
                            autoComplete="username"
                            validation={{ validate: isValidEmail }}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="outlined"
                            disabled={isSubmitting}
                            sx={{ textTransform: "none" }}
                        >
                            {isSubmitting ?
                                <CircularProgress color="inherit" size={24} /> :
                                "Reset Password"
                            }
                        </Button>
                    </Stack>
                </form>
            </Popover>
        </>
    );
}