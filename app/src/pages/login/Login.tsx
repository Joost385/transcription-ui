import { useForm, TextFieldElement, PasswordElement } from "react-hook-form-mui";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Collapse from "@mui/material/Collapse";
import EmailIcon from "@mui/icons-material/Email";
import useSecurityStore from "../../state/useSecurityStore";
import LayoutLogin from "../../components/layout/LayoutLogin";
import { LoginData, login } from "../../utils/security";
import { isValidEmail } from "../../utils/validation";
import PasswordResetButton from "./PasswordResetButton";

export default function Login() {
    const isLoadingUser = useSecurityStore(state => state.isLoading);

    const {
        control,
        setError,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<LoginData>();

    const onSubmit = handleSubmit(
        async data => {
            try {
                await login(data);
            } catch (e: any) {
                setError("root", { message: e.message });
            }
        }
    );

    const isLoading = isSubmitting || isLoadingUser;

    return (
        <LayoutLogin>
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
                    <TextFieldElement
                        required
                        name="username"
                        label="Email"
                        control={control}
                        disabled={isLoading}
                        autoComplete="username"
                        validation={{ validate: isValidEmail }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment
                                    position="end"
                                    sx={{ mr: 1 }}
                                >
                                    <EmailIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <PasswordElement
                        required
                        control={control}
                        disabled={isLoading}
                        label="Password"
                        name="password"
                    />
                    <Button
                        fullWidth
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <CircularProgress color="inherit" size={24} /> :
                            "Login"
                        }
                    </Button>
                </Stack>
            </form>
            <PasswordResetButton sx={{ mt: 2, ml: "auto" }} />
        </LayoutLogin>
    );
}