//Importamos desde pages q es el q esta haciendo el lazy load

import { ForgotPassword, Home, Login, Register, ResetPassword, VerifyEmail} from "./pages"

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
        path: "/forgot-password",
        element: <ForgotPassword/>
    },
    {
        path: "/reset-password/:token",
        element: <ResetPassword/>
    },
    
    {
        path: "/verify-email",
        element: <VerifyEmail/>
    },
    
]
    
