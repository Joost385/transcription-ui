import { forwardRef } from "react";
import { TransitionProps } from "@mui/material/transitions";
import Grow from "@mui/material/Grow";

const DialogTransition = forwardRef((
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) =>
    <Grow ref={ref} {...props} />
);

export default DialogTransition;