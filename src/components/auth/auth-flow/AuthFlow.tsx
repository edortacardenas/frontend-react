"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Lock, User, Mail } from "lucide-react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { useAuth } from '@/context/AuthContext';
import { loginSchema, registerSchema } from "@/lib/zod";
import { onSubmitHelper, onRegisterSubmitHelper, handleVerifyOtpHelper, handleResendOtpHelper } from "../../../lib/helpers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from "../../ui/spinner";
import Modal from "../../modals/modal";

interface AuthFlowProps {
  variant: 'LOGIN' | 'REGISTER';
}

const AuthFlow = ({ variant }: AuthFlowProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showMethodSelectionModal, setShowMethodSelectionModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const isLogin = variant === 'LOGIN';
  const schema = isLogin ? loginSchema : registerSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    if (isLogin) {
      const result = await onSubmitHelper({
        values: values as z.infer<typeof loginSchema>,
        setIsLoading,
        setEmailState: setEmail,
      });
      if (result.success && !result.mfaRequired) {
        login();
        navigate("/dashboard");
      } else if (result.mfaRequired && result.email) {
        setShowMethodSelectionModal(true);
      }
    } else {
      await onRegisterSubmitHelper({
        values: values as z.infer<typeof registerSchema>,
        setIsLoading,
        setEmailState: setEmail,
        setShowMethodSelectionModal,
      });
    }
    setIsLoading(false);
  }

  async function handleVerifyOtp() {
    await handleVerifyOtpHelper({
      email,
      otp,
      setShowModal: setShowOtpModal,
      setOtp,
      successMessage: isLogin ? "Verificación exitosa. Accediendo..." : "Cuenta verificada. Por favor, inicia sesión.",
      onSuccess: () => {
        if (isLogin) {
          login();
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      },
    });
  }

  async function handleResendOtp() {
    await handleResendOtpHelper({ email });
  }

  const handleSelectVerificationMethod = async (method: "computer" | "movil") => {
    // Esta función es idéntica para ambos flujos y puede permanecer aquí
    setShowMethodSelectionModal(false);
    if (!email) {
        toast.error("No se pudo obtener el correo. Inténtalo de nuevo.");
        return;
    }
    setIsLoading(true);
    try {
        const endpoint = method === "computer" 
            ? "/api/send-otp" 
            : "/api/auth/request-email-verification";
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            toast.success(data.msg || "Solicitud enviada. Revisa tu correo.");
            if (method === "computer") {
                setShowOtpModal(true);
            }
        } else {
            toast.error(data.msg || "Error al realizar la solicitud.");
        }
    } catch (error) {
        toast.error("Error de red al realizar la solicitud.");
    } finally {
        setIsLoading(false);
    }
  };

  // Configuraciones basadas en la variante
  const pageConfig = {
    title: isLogin ? "Iniciar sesión" : "Registro de cuenta",
    description: isLogin ? "Ingresa tus credenciales para acceder" : "Rellena los campos para crear tu cuenta",
    submitButtonText: isLogin ? "Iniciar sesión" : "Registrarse",
    footerText: isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?",
    footerLinkText: isLogin ? "Regístrate" : "Iniciar sesión",
    footerLinkTo: isLogin ? "/register" : "/login",
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white overflow-x-hidden">
        <div className="w-full max-w-md space-y-8">
          <Card className="w-full shadow-lg" style={{ background: "transparent" }}>
            <CardHeader className="space-y-1 text-center">
                <div className="bg-blue-900 text-gray-300 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    {isLogin ? <Lock className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <h2 className="text-3xl font-bold text-gray-400 pt-2">{pageConfig.title}</h2>
                <p className="text-gray-400">{pageConfig.description}</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {!isLogin && (
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="johndoe" className="pl-10 border-b border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="email" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="mail@example.com" type="email" className="pl-10 border-b border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type={passwordVisible ? 'text' : 'password'} placeholder="**********" className="pl-10 border-b border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none" {...field} />
                          <button type='button' onClick={() => setPasswordVisible(!passwordVisible)} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400'>
                            {passwordVisible ? <AiOutlineEyeInvisible className='h-5 w-5' /> : <AiOutlineEye className='w-5 h-5' />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )} />

                  {!isLogin && (
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type={confirmPasswordVisible ? 'text' : 'password'} placeholder="**********" className="pl-10 border-b border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none" {...field} />
                            <button type='button' onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400'>
                                {confirmPasswordVisible ? <AiOutlineEyeInvisible className='h-5 w-5' /> : <AiOutlineEye className='w-5 h-5' />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )} />
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-end text-sm">
                      <Link to="/forgot-password" className="font-medium text-gray-300 hover:text-primary/80">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-900 to-blue-500 text-white py-2 mt-8 rounded-lg hover:bg-gradient-to-l hover:from-blue-300 hover:to-blue-600" disabled={isLoading}>
                    {isLoading ? <Spinner /> : pageConfig.submitButtonText}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="text-center font-bold text-gray-400 text-sm w-full">
                {pageConfig.footerText}{" "}
                <Link to={pageConfig.footerLinkTo} className="text-blue-300 hover:underline">
                  {pageConfig.footerLinkText}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Modal
        email={email}
        otp={otp}
        setOtp={setOtp}
        showModal={showOtpModal}
        setShowModal={setShowOtpModal}
        handleVerifyOtp={handleVerifyOtp}
        handleResendOtp={handleResendOtp}
      />

      <Dialog open={showMethodSelectionModal} onOpenChange={setShowMethodSelectionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Método de Verificación</DialogTitle>
            <DialogDescription>
              Elige cómo deseas verificar tu identidad para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleSelectVerificationMethod("computer")} disabled={isLoading}>
              {isLoading ? <Spinner /> : "Verificar con OTP"}
            </Button>
            <Button variant="outline" onClick={() => handleSelectVerificationMethod("movil")} disabled={isLoading}>
              {isLoading ? <Spinner /> : "Verificar por Link en Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthFlow;