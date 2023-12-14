import { useEffect } from "react";

export default function usePreventDataLoss(isDataUnsaved: boolean) {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isDataUnsaved) {
            e.preventDefault();
            e.returnValue = "";
        }
    };

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDataUnsaved]);
};
