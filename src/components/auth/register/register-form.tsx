"use client"

// import { toast } from "react-hot-toast"; // Se maneja en helpers
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Lock, User, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Shadcn Dialog
import { registerSchema } from "@/lib/zod"
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../modals/modal";
//import Social from "../../social/social";
import Spinner from "../../ui/spinner"; // Importar Spinner
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  onRegisterSubmitHelper,
  handleRegisterVerifyOtpHelper,
  handleRegisterResendOtpHelper
} from "../../../lib/helpers"; // Ajusta la ruta si es necesario
import { toast } from "react-hot-toast";

 const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rectPasswordVisible, setRectPasswordVisible] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white overflow-x-hidden">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
    <Card className="w-full shadow-lg" style={{background:"transparent"}}>
      <CardHeader className="space-y-1">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-blue-900 text-primary-foreground p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-400 text-center mb-4">Registro de cuenta</h2>
          <p className="text-gray-400 text-center mb-6">
            Rellena los campos para crear tu cuenta
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className='relative space-y-2  mt-4'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                <FormLabel className=' block text-gray-300 font-medium mb-1 mt-4'>Nombre</FormLabel>
                <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder='johndoe'className='pl-10 border-b border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none' {...field} />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500"/>
              </FormItem>
              )}
            />
            </div>
            <div className='relative space-y-2  mt-4'>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=' block text-gray-300 font-medium mb-1 mt-4'>Correo Electronico</FormLabel>
                  <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder='mail@example.com' type="email" className='pl-10 border-b
                    border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none'  {...field} />
                  </div>
                  </FormControl>
                  <FormMessage className="text-red-500"/>
                </FormItem>
              )}
            />
            </div>
            <div className='relative space-y-2  mt-4'>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=' block text-gray-300 font-medium mb-1'>Contraseña</FormLabel>
                  <FormControl >
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="**********" type={passwordVisible ? 'text' : 'password'} className='pl-10 border-b
                    border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none' {...field} />
                  </div> 
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <button type='button' onClick={() => setPasswordVisible(!passwordVisible)} className=' absolute right-2 top-8.5 text-gray-400 hover:text-cyan-400 focus:outline-none'>
                    {passwordVisible ? (
                        <AiOutlineEyeInvisible className='h-5 w-5' />
                    ) : (<AiOutlineEye className='w-5 h-5' />)}
                    </button>
            </div>

            
            <div className='relative space-y-2  mt-4'>
            <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel className=' block text-gray-300 font-medium mb-1'>Re-Enter your password</FormLabel>
                <FormControl>
                  <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="**********" type={rectPasswordVisible ? 'text' : 'password'} className=' pl-10 border-b
                    border-gray-600 bg-transparent text-white focus:border-cyan-400 focus:outline-none' {...field}
                  />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500"/>
              </FormItem>
            )}
          />
          <button type='button' onClick={() => setRectPasswordVisible(!rectPasswordVisible)} className=' absolute right-2 top-8.5 text-gray-400 hover:text-cyan-400 focus:outline-none'>
                    {rectPasswordVisible ? (
                        <AiOutlineEyeInvisible className='h-5 w-5' />
                    ) : (<AiOutlineEye className='w-5 h-5' />)}
                    </button>
          </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-900 to-blue-500 text-white py-2 mt-8 rounded-lg hover:bg-gradient-to-l
           hover:from-blue-300 hover:to-blue-600 transition-all duration-300 focus:ring focus:ring-cyan-300
            focus:outline-none shadow-md hover:shadow-lg" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Registrarse"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
      {/**<div className="relative flex justify-center text-xs uppercase">
            <h2 className="font-bold text-gray-900 dark:text-white">O regístrate con</h2>
          </div>
        {/**Social Buttons */}
        {/** <Social/> */ }
        
        <div className="font-bold text-center text-sm mt-4 text-gray-400 ">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-blue-300 hover:underline">
            Iniciar sesión
          </Link>
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