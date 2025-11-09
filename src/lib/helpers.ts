import { toast } from "react-hot-toast";
import { z } from "zod";
import { NavigateFunction } from "react-router-dom";
import { loginSchema, registerSchema } from "./zod";

// --- TIPOS COMPARTIDOS ---

// Tipos para Login
interface OnSubmitHelperArgs {
  values: z.infer<typeof loginSchema>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  setEmailState: React.Dispatch<React.SetStateAction<string>>;
}

export interface OnSubmitHelperResult {
  success: boolean;
  mfaRequired?: boolean;
  email?: string;
}

// Tipos para Registro
interface OnRegisterSubmitHelperArgs {
  values: z.infer<typeof registerSchema>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEmailState: React.Dispatch<React.SetStateAction<string>>;
  setShowMethodSelectionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Tipos para OTP
interface HandleVerifyOtpArgs {
  email: string;
  otp: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  onSuccess: () => void; // Callback para acciones post-verificación
  successMessage: string; // Mensaje de éxito personalizable
}

interface HandleResendOtpArgs {
  email: string;
}

// --- FUNCIONES HELPER PARA LOGIN ---

export const onSubmitHelper = async ({
  values,
  setEmailState,
}: Omit<OnSubmitHelperArgs, "navigate">): Promise<Omit<OnSubmitHelperResult, "navigate">> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Inicio de sesión exitoso");
      return { success: true, mfaRequired: false };
    }

    const errorMessage = data.msg?.msg || data.msg || "Error desconocido.";
    toast.error("Error: " + errorMessage);

    if (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes("verifica") || errorMessage.toLowerCase().includes("otp"))) {
      setEmailState(values.email);
      return { success: false, mfaRequired: true, email: values.email };
    }

    return { success: false };

  } catch (error) {
    toast.error("Error en la petición de inicio de sesión.");
    console.error("Error en la petición:", error);
    return { success: false };
  }
};

// --- FUNCIONES HELPER PARA REGISTRO ---

export const onRegisterSubmitHelper = async ({
  values,
  setIsLoading,
  setEmailState,
  setShowMethodSelectionModal,
}: OnRegisterSubmitHelperArgs) => {
  try {
    setIsLoading(true);
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.msg || "Registro exitoso. Ahora debes verificar tu cuenta.");
      setEmailState(values.email);
      setShowMethodSelectionModal(true);
    } else {
      toast.error(data.msg || "Error en el registro.");
    }
  } catch (error) {
    toast.error("Error en la petición de registro.");
    console.error("Error en la petición de registro:", error);
  } finally {
    setIsLoading(false);
  }
};


// --- FUNCIONES HELPER UNIFICADAS PARA OTP ---

/**
 * Unificada para verificar OTP tanto en registro como en login.
 */
export const handleVerifyOtpHelper = async ({
  email,
  otp,
  setShowModal,
  setOtp,
  onSuccess,
  successMessage,
}: HandleVerifyOtpArgs) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      toast.success(successMessage);
      setShowModal(false);
      onSuccess(); // Ejecuta las acciones de éxito (ej. login() y navigate())
    } else {
      const data = await response.json();
      toast.error(data.msg || "Error en la verificación del OTP.");
      setOtp("");
    }
  } catch (error) {
    console.error("Error verificando OTP:", error);
    toast.error("Error en la petición de verificación de OTP.");
    setOtp("");
  }
};

/**
 * Reenvía el código OTP. Sirve tanto para login como para registro.
 */
export const handleResendOtpHelper = async ({ email }: HandleResendOtpArgs) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      toast.success("Reenvío de OTP exitoso, verifique su correo");
    } else {
      const data = await response.json();
      toast.error(data.msg || "Error en reenvío, intente otra vez");
    }
  } catch (error) {
    console.error("Error resending OTP:", error);
    toast.error("Error de red al reenviar OTP.");
  }
};