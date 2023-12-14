import { useParams, useNavigate } from "react-router-dom";
import { useForm, PasswordElement, PasswordRepeatElement } from "react-hook-form-mui";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import LayoutLogin from "../components/layout/LayoutLogin";
import LoginIcon from "@mui/icons-material/Login"
import { HttpStatus, apiFetch } from "../utils/api";
import { ValidationErrors, setFormErrors } from "../utils/validation";

export default function PasswordReset() {
    const { token } = useParams();
    const navigate = useNavigate();

    const {
        control,
        setError,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<{
        password: string;
        password_repeat: string;
    }>();

    const onSubmit = handleSubmit(
        async data => {
            const response = await apiFetch(`security/password_reset/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === HttpStatus.UnprocessableEntity) {
                    setFormErrors(responseData as ValidationErrors, setError);
                } else {
                    setError("root", { message: "Could not reset password." });
                }
            } else {
                navigate("/");
            }
        }
    )

    return (
        <LayoutLogin>
            <Button
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate("/")}
                sx={{
                    position: "fixed",
                    top: 16,
                    left: 16,
                }}
            >
                Login
            </Button>
            <form
                onSubmit={onSubmit}
                style={{ width: "100%", marginTop: 30 }}
            >
                <Collapse in={!!errors.root}>
                    <Alert sx={{ mb: 3 }} severity="error">
                        {errors.root?.message}
                    </Alert>
                </Collapse>
                <Stack gap={3}>
                    <PasswordElement
                        required
                        control={control}
                        disabled={isSubmitting}
                        label="Password"
                        name="password"
                    />
                    <PasswordRepeatElement
                        required
                        control={control}
                        disabled={isSubmitting}
                        label="Repeat Password"
                        name="password_repeat"
                        passwordFieldName="password"
                    />
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ?
                            <CircularProgress color="inherit" size={24} /> :
                            "Set Password"
                        }
                    </Button>
                </Stack>
            </form>
        </LayoutLogin>
    );
}