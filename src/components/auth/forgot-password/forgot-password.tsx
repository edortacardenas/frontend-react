import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "../../ui/spinner"; // Import the Spinner component

const forgotPasswordSchema = z.object({
  email: z.string().trim()
    .min(1, { message: "El email es requerido." })
    .email({ message: "Por favor, introduce un email válido." }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true); // Open modal by default
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSendResetLink = async (data: ForgotPasswordFormData) => {
    // The email is now validated by Zod and comes from form data
    const emailToReset = data.email;

    setIsLoading(true);
    try {
      // Ensure this is your backend endpoint for initiating password reset
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToReset }),
      });

      if (response.ok) {
        toast.success("Reset successfully check yor email to change your password");
        setIsModalOpen(false);
        navigate('/login'); // Or to a page confirming email sent
      } else {
        // Attempt to parse error message from backend if available
        try {
          const errorData = await response.json();
          toast.error(errorData.msg || "Ocurrio un error trate otra vez 1");
        } catch (e) {
         toast.error("Ocurrio un error trate otra vez 2");
        }
      }
    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast.error("Ocurrio un error trate otra vez");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    navigate('/login');
  };



  if (!isModalOpen) {
    return null; // Or a loading indicator/message
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
      setIsModalOpen(open);
    }}>
      <DialogContent
        className="sm:max-w-[480px] bg-white dark:bg-gray-900 shadow-xl rounded-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Forgot Password</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-1">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSendResetLink)} className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tuemail@ejemplo.com"
              {...form.register("email")}
              className="border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500" role="alert">{form.formState.errors.email.message}</p>
            )}
          </div>
          <DialogFooter className="pt-4 sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
              {isLoading ? <Spinner /> : null}
              Enviar Link de Reseteo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPassword;
