import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Recordings from "./pages/recordings/Recordings";
import Transcriptions from "./pages/transcriptions/Transcriptions";
import Help from "./pages/help/Help";
import Users from "./pages/users/Users";
import Monitoring from "./pages/monitoring/Monitoring";
import PasswordReset from "./pages/PasswordReset";

export default createBrowserRouter([
    {
        path: "",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Recordings />
            },
            {
                path: "transcriptions",
                element: <Transcriptions />
            },
            {
                path: "help",
                element: <Help />
            },
            {
                path: "users",
                element: <Users />
            },
            {
                path: "monitoring",
                element: <Monitoring />
            },
        ]
    },
    {
        path: "password-reset/:token",
        element: <PasswordReset />,
    }
]);