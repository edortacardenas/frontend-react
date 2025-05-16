// src/lib/helpers.tsx
import { toast } from "react-hot-toast";
import { z } from "zod";
import { NavigateFunction } from "react-router-dom";
import { loginSchema, registerSchema } from "./zod"; // Asegúrate que la ruta a zod.ts sea correcta

// Tipos para los argumentos de las funciones helper
interface OnSubmitHelperArgs {
  values: z.infer<typeof loginSchema>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  setEmailState: React.Dispatch<React.SetStateAction<string>>; // Renombrado para claridad
  // setShowModal: React.Dispatch<React.SetStateAction<boolean>>; // No longer directly controlled by onSubmitHelper
}

export interface OnSubmitHelperResult {
  success: boolean;
  mfaRequired?: boolean;
  email?: string; // Email of the user if MFA is required
  message?: string; // General message or error message
}

interface HandleOtpArgs {
  email: string;
  otp: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
}
interface HandleResendOtpArgs {
  email: string;
}

// Tipos para los argumentos de las funciones helper de REGISTRO
interface OnRegisterSubmitHelperArgs {
  values: z.infer<typeof registerSchema>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  setEmailState: React.Dispatch<React.SetStateAction<string>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Podríamos reutilizar HandleOtpArgs y HandleResendOtpArgs si la lógica es idéntica
// o crear unas nuevas si hay diferencias sutiles. Por claridad, las defino aunque sean iguales por ahora.
interface HandleRegisterVerifyOtpHelperArgs extends HandleOtpArgs {}
interface HandleRegisterResendOtpHelperArgs extends HandleResendOtpArgs {}


// --- FUNCIONES HELPER PARA LOGIN ---

export const onSubmitHelper = async ({
  values,
  setIsLoading,
  navigate,
  setEmailState,
  // setShowModal, // No longer used here
}: OnSubmitHelperArgs): Promise<OnSubmitHelperResult> => {
  console.log(typeof(navigate))
  try {
    setIsLoading(true);
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      credentials: "include",
    });

    const data = await response.json();
    if (response.status === 200) {
      toast.success("Inicio de sesión exitoso");
      // navigate("/dashboard"); // Navigation will be handled by the calling component
      return { success: true, mfaRequired: false, message: "Inicio de sesión exitoso" };
    } else {
      const errorMessage = data.msg?.msg || data.msg || "Error desconocido en el inicio de sesión.";
      toast.error("Error: " + errorMessage);
      // Check if the error message indicates OTP verification is needed
      if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes("verifica")) {
        setEmailState(values.email);
        // setShowModal(true); // This will be handled by the calling component
        return { success: false, mfaRequired: true, email: values.email, message: errorMessage };
      } else {
        console.log("No se requiere verificación OTP o error desconocido.");
        return { success: false, message: errorMessage };
      }
    }
  } catch (error) {
    toast.error("Error en la petición");
    console.error("Error en la petición:", error);
    return { success: false, message: "Error en la petición de red." };
  } finally {
    setIsLoading(false);
  }
};

export const handleVerifyOtpHelper = async ({
  email,
  otp,
  setShowModal,
  navigate,
  setOtp,
}: HandleOtpArgs) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      toast.success("Success verification");
      setShowModal(false);
      navigate("/login"); // O a donde deba ir después de verificar OTP
    } else {
      toast.error("Error in verification");
      setOtp("");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    toast.error("Error in verification");
    setOtp("");
  }
};

export const handleResendOtpHelper = async ({
  email,
}: HandleResendOtpArgs) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      toast.success("Reenvio de OTP exitoso, verifique su correo");
    } else {
      toast.error("Error en reenvio, trate otra vez");
    }
  } catch (error) {
    console.error("Error resending OTP:", error);
    toast.error("Error en reenvio, trate otra vez");
  }
};

// --- FUNCIONES HELPER PARA REGISTRO ---

export const onRegisterSubmitHelper = async ({
  values,
  setIsLoading,
  navigate,
  setEmailState,
  setShowModal,
}: OnRegisterSubmitHelperArgs) => {
  console.log(typeof(navigate))
  try {
    setIsLoading(true);
    // Asumimos que el endpoint de registro es /api/register
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // No enviamos confirmPassword al backend, ya fue validado por Zod
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (response.status === 201 || response.status === 200) { // 201 para creado, 200 si ya requiere OTP
      toast.success(data.msg || "Registro exitoso. Por favor verifica tu correo.");
      setEmailState(values.email); // Guardamos el email para la verificación OTP
      setShowModal(true); // Mostramos el modal de OTP
      // No navegamos aún, esperamos la verificación OTP
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

export const handleRegisterVerifyOtpHelper = async ({
  email,
  otp,
  setShowModal,
  navigate,
  setOtp,
}: HandleRegisterVerifyOtpHelperArgs) => {
  // Esta lógica podría ser idéntica a handleVerifyOtpHelper si el endpoint es el mismo
  // y el comportamiento post-verificación es similar (ej. redirigir a login)
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`, { // Asumiendo mismo endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
      toast.success("Verificación exitosa. Ahora puedes iniciar sesión.");
      setShowModal(false);
      navigate("/login"); // Redirigir a login después de verificar el registro
    } else {
      const data = await response.json();
      toast.error(data.msg || "Error en la verificación del OTP.");
      setOtp("");
    }
  } catch (error) {
    console.error("Error verificando OTP de registro:", error);
    toast.error("Error en la verificación del OTP.");
    setOtp("");
  }
};

export const handleRegisterResendOtpHelper = async ({ email }: HandleRegisterResendOtpHelperArgs) => {
  // Esta lógica es probablemente idéntica a handleResendOtpHelper
  try {
    // Reutilizamos la lógica de handleResendOtpHelper ya que el endpoint y comportamiento son iguales
    await handleResendOtpHelper({ email });
  } catch (error) {
    // El toast de error ya se maneja dentro de handleResendOtpHelper
    console.error("Error reenviando OTP de registro:", error);
  }
};
