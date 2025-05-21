import Home from "@/components/personal/home/home";
import React from "react";

export { Home }

export const Login = React.lazy(() => import("../components/auth/login/login-form"));
export const Register = React.lazy(() => import("../components/auth/register/register-form"));
export const Dashboard = React.lazy(() => import("../components/personal/dashboard/dashboard"));
export const Config = React.lazy(() => import("../components/personal/config/config"));
export const ForgotPassword = React.lazy(() => import("../components/auth/forgot-password/forgot-password"));
export const ResetPassword = React.lazy(() => import("../components/auth/reset-password/reset-password"));
export const Noticias = React.lazy(() => import("../components/social/noticias"));
export const VerifyEmail = React.lazy(() => import("../components/auth/verify-email/verify-email"));
//export const ProtectedRoutes = React.lazy(() => import("../components/auth/protected-routes/protected-routes"));