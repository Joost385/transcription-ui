import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import DialogTransition from "./DialogTransition";
import useUserFormStore from "../state/useUserFormStore";
import useSecurityStore from "../state/useSecurityStore";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";
import { UserEdit, userDefaultValues } from "../models/User";
import { HttpStatus, apiFetch } from "../utils/api";
import {
    isValidEmail,
    setFormErrors,
    ValidationErrors,
} from "../utils/validation";
import {
    useForm,
    TextFieldElement,
    CheckboxElement,
} from "react-hook-form-mui";

export default function UserFormDialog() {
    const user = useUserFormStore(state => state.user);
    const isOpen = useUserFormStore(state => state.isOpen);
    const onSuccess = useUserFormStore(state => state.onSuccess);
    const handleClose = useUserFormStore(state => state.handleClose);
    const me = useSecurityStore(state => state.user);
    const isItMe = user?.id === me?.id;

    useLocationChangeCallback(handleClose);

    const {
        reset,
        setError,
        handleSubmit,
        control,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<UserEdit>();

    useEffect(() => {
        if (isOpen) {
            user ?
                reset(user) :
                reset(userDefaultValues);
        }
    }, [user, isOpen]);

    const onSubmit = handleSubmit(
        async data => {
            const path = user?.id ? `users/${user.id}` : "users";
            const method = user?.id ? "PATCH" : "POST";
            const response = await apiFetch(path, {
                method,
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === HttpStatus.UnprocessableEntity) {
                    setFormErrors(responseData as ValidationErrors, setError);
                } else {
                    setError("root", { message: "An Error occurred while submitting the form." });
                }
            } else {
                onSuccess?.(responseData);
                handleClose();
            }
        }
    );

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={isOpen}
            onClose={isSubmitting ? undefined : handleClose}
            TransitionComponent={DialogTransition}
        >
            <DialogTitle
                display="flex"
                alignItems="center"
            >
                {user ?
                    <PersonIcon sx={{ mr: 1 }} /> :
                    <PersonAddIcon sx={{ mr: 1 }} />
                }
                {user ? "Edit" : "Create"} User
                <IconButton
                    sx={{ ml: "auto" }}
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Collapse in={!!errors.root}>
                        <Alert sx={{ mb: 3 }} severity="error">
                            {errors.root?.message}
                        </Alert>
                    </Collapse>
                    <Stack gap={3}>
                        <Stack direction="row" gap={2}>
                            <CheckboxElement
                                name="active"
                                label="Active"
                                control={control}
                                disabled={isSubmitting || isItMe}
                            />
                            <CheckboxElement
                                name="admin"
                                label="Admin"
                                control={control}
                                disabled={isSubmitting || isItMe}
                            />
                        </Stack>
                        <TextFieldElement
                            fullWidth
                            required
                            name="email"
                            label="Email"
                            control={control}
                            disabled={isSubmitting}
                            validation={{ validate: isValidEmail }}
                        />
                        <TextFieldElement
                            fullWidth
                            required
                            name="firstname"
                            label="First name"
                            control={control}
                            disabled={isSubmitting}
                        />
                        <TextFieldElement
                            fullWidth
                            required
                            name="lastname"
                            label="Last name"
                            control={control}
                            disabled={isSubmitting}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        type="submit"
                        disabled={isSubmitting}
                        startIcon={
                            isSubmitting ?
                                <CircularProgress
                                    color="inherit"
                                    size={20}
                                /> :
                                <SaveIcon />
                        }
                    >
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}