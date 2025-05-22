import Home from "@/components/personal/home/home";
import Login from "@/components/auth/login/login-form";
import Register from "@/components/auth/register/register-form";
import Dashboard from "@/components/personal/dashboard/dashboard";

import React from "react";

export { Home, Login, Register, Dashboard }

export const Config = React.lazy(() => import("../components/personal/config/config"));
export const ForgotPassword = React.lazy(() => import("../components/auth/forgot-password/forgot-password"));
export const ResetPassword = React.lazy(() => import("../components/auth/reset-password/reset-password"));
export const Noticias = React.lazy(() => import("../components/social/noticias"));
export const VerifyEmail = React.lazy(() => import("../components/auth/verify-email/verify-email"));