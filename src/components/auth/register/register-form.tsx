"use client"

// import { toast } from "react-hot-toast"; // Se maneja en helpers
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Lock, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Shadcn Dialog
import { registerSchema } from "@/lib/zod"
import { useNavigate } from "react-router-dom";
import Modal from "../../modals/modal";
import Social from "../../social/social";
import Spinner from "../../ui/spinner"; // Importar Spinner
import {
  onRegisterSubmitHelper,
  handleRegisterVerifyOtpHelper,
  handleRegisterResendOtpHelper
} from "../../../lib/helpers"; // Ajusta la ruta si es necesario
import { toast } from "react-hot-toast";

 const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMethodSelectionModal, setShowMethodSelectionModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await onRegisterSubmitHelper({
      values,
      setIsLoading,
      navigate, 
      setEmailState: setEmail,
      // Pass setShowMethodSelectionModal to the helper.
      // This assumes onRegisterSubmitHelper will call this function on success.
      setShowModal: setShowMethodSelectionModal, 
    });
  }

  async function handleVerifyOtp() {
    await handleRegisterVerifyOtpHelper({
      email,
      otp,
      setShowModal,
      navigate,
      setOtp,
    });
  }

  async function handleResendOtp() {
    await handleRegisterResendOtpHelper({ email });
  }

  const handleSelectVerificationMethod = async (method: "computer" | "movil") => {
    setShowMethodSelectionModal(false); // Close the selection modal

    if (method === "computer") {
      if (!email) {
        toast.error("No se pudo obtener el correo electrónico. Intenta iniciar sesión de nuevo.");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/send-otp`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          // For Scenario 2 (initial verification), this endpoint on the backend
          // does not use authValid, so credentials: "include" is not strictly
          // necessary for *this specific call* but kept for consistency.
          credentials: "include", 
          body: JSON.stringify({ email }), // Send email in the body
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.msg || "Se ha enviado un OTP a tu correo. Ingrésalo a continuación.");
          setShowModal(true); // Mostrar el modal para ingresar el OTP
        } else {
          toast.error(data.msg || "Error al solicitar el OTP por correo.");
        }
      } catch (error) {
        toast.error("Error de red al solicitar el OTP.");
        console.error("Error requesting OTP email:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (method === "movil") {
      if (!email) {
        toast.error("No se pudo obtener el correo electrónico. Intenta iniciar sesión de nuevo.");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/request-email-verification`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          // For Scenario 2 (initial verification), this endpoint on the backend
          // does not use authValid, so credentials: "include" is not strictly
          // necessary for *this specific call* but kept for consistency.
          credentials: "include", 
          body: JSON.stringify({ email }), // Send email in the body
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(data.msg || "Correo de verificación enviado. Revisa tu bandeja de entrada.");
          // User now needs to check their email and click the link.
          // You might want to show a message on the UI or redirect to a "check your email" page.
        } else {
          toast.error(data.msg || "Error al solicitar la verificación por correo.");
        }
      } catch (error) {
        toast.error("Error de red al solicitar verificación por correo.");
        console.error("Error requesting email verification:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[url('/textura1.jpg')] bg-cover bg-center md:bg-[url('/noticias-home.jpg')] md:bg-contain md:bg-no-repeat md:bg-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
    <Card className="w-full shadow-lg" style={{background:"transparent"}}>
      <CardHeader className="space-y-1">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-primary text-primary-foreground p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
            <User className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Registro de cuenta</h2>
          <p className="mt-2 text-sm text-gray-900 dark:text-gray-400 font-bold">
            Rellena los campos para crear tu cuenta
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Ingresa tu nombre de usuario" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="Ingresa tu correo electrónico" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Crea tu contraseña" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Confirma tu contraseña" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Registrarse"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
      <div className="relative flex justify-center text-xs uppercase">
            <h2 className="font-bold text-gray-900 dark:text-white">O regístrate con</h2>
          </div>
        {/**Social Buttons */}
        <Social/>
        <div className="font-bold text-center text-sm mt-4 text-gray-900 dark:text-white">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="font-bold text-gray-900 dark:text-white hover:text-primary/80">
            Iniciar sesión
          </a>
        </div>
      </CardFooter>
      </Card>
      </div>
      </div>
    </div>
      {/* Modal */}
    <Modal 
    email= {email}
    otp = {otp}
    setOtp = {setOtp}
    showModal = {showModal}
    setShowModal ={setShowModal}
    handleVerifyOtp = {handleVerifyOtp}
    handleResendOtp = {handleResendOtp}
    />
    {/* Method Selection Modal */}
    <Dialog open={showMethodSelectionModal} onOpenChange={setShowMethodSelectionModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Método de Verificación</DialogTitle>
          <DialogDescription>
            Elige cómo deseas verificar tu identidad para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => handleSelectVerificationMethod("computer")}
            disabled={isLoading}
          >
            {isLoading ? <Spinner/> : "Verificar con OTP (Computer)"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSelectVerificationMethod("movil")}
            disabled={isLoading}
          >
            {isLoading ? <Spinner/> : "Verificar por Link (Movil)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  )
}

export default RegisterForm