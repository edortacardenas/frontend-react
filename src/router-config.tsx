//Importamos desde pages q es el q esta haciendo el lazy load

import { Config, Dasboard, ForgotPassword, Home, Login, Register, ResetPassword, VerifyEmail, Noticias} from "./pages"

export const routes = [
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/dashboard",
        element: <Dasboard/>
    },
    {
        path: "/config",
        element: <Config/>
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword/>
    },
    {
        path: "/reset-password/:token",
        element: <ResetPassword/>
    },
    {
        path: "/noticias",
        element: <Noticias/>
    },
    {
        path: "/verify-email",
        element: <VerifyEmail/>
    },
]
    
