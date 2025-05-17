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

interface AuthStatusResponse {
  isAuthenticated: boolean;
  //isAdmin?: boolean; // Optional: if your /status endpoint also returns admin role
}

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Define User-related types and enums here
export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserFormData {
  name: string;
  email: string;
  role: Role;
}
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


/**
 * Fetches the authentication status from the backend.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is authenticated,
 * false if not authenticated (HTTP 401), or throws an error for other issues.
 */
export const fetchAuthStatus = async (): Promise<boolean> => {
  try {
    // Adjust this endpoint to your configuration real in @users.js or similar
    const response = await fetch(`${API_BASE_URL}/login/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante para enviar cookies de sesión
    });

    if (response.ok) {
      const data: AuthStatusResponse = await response.json();
      // Ensure the backend response structure is as expected
      if (typeof data.isAuthenticated !== 'boolean') {
          console.error("Auth status response did not contain a boolean 'isAuthenticated' field:", data);
          throw new Error("Invalid auth status response format from backend");
      }
      return data.isAuthenticated; // Asume que el backend devuelve { isAuthenticated: boolean }
    }

    if (response.status === 401) {
      // Usuario no autenticado, es un caso esperado.
      return false;
    }

    // Otro tipo de error HTTP (ej. 403, 404, 500).
    // Estos sí podrían ser inesperados para esta llamada y merecen una advertencia.
    console.warn(`Unexpected HTTP error when checking auth status: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to check authentication status: HTTP ${response.status} ${response.statusText}`);

  } catch (error) {
    // Error de red (servidor no alcanzable, DNS, etc.) o error al parsear JSON,
    // or an error re-thrown from above.
    if (error instanceof Error && (error.message.startsWith('Failed to check authentication status:') || error.message.startsWith('Invalid auth status response format'))) {
        // This is an error we've already logged or identified, re-throw it.
        throw error;
    }
    console.error("Network or parsing error checking auth status:", error);
    // Re-throw the error so the calling component knows something went wrong.
    throw new Error(`Network or parsing error during auth check: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Logs out the current user.
 * @returns {Promise<void>} Resolves on successful logout, throws error otherwise.
 */
export const logoutUser = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Logout failed with status: ${response.status}` }));
    throw new Error(errorData.message || `Logout failed with status: ${response.status}`);
  }
};

/**
 * Fetches the admin status of the current user.
 * (Consider if this is still needed if fetchAuthStatus returns isAdmin)
 * @returns {Promise<boolean>} True if admin, false otherwise.
 */
export const fetchAdminRole = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/admin/status`, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    const data = await response.json();
    return data.isAdmin === true;
  }
  if (response.status === 401) return false; // Not authenticated, thus not admin
  const errorData = await response.json().catch(() => ({ message: `Failed to fetch admin status: ${response.status}` }));
  throw new Error(errorData.message || `Failed to fetch admin status: ${response.status}`);
};

/**
 * Fetches all users. (Requires admin privileges)
 * @returns {Promise<User[]>} A list of users.
 */
export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error fetching users: ${response.statusText}` }));
    throw new Error(errorData.message || `Error fetching users: ${response.statusText}`);
  }
  const data = await response.json();
  return data.users || data; // Adjust based on your API response structure
};

/**
 * Deletes a user by ID. (Requires admin privileges)
 * @param userId The ID of the user to delete.
 * @returns {Promise<void>} Resolves on successful deletion.
 */
export const deleteUserById = async (userId: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error deleting user: ${response.statusText}` }));
    throw new Error(errorData.message || `Error deleting user: ${response.statusText}`);
  }
};

/**
 * Fetches details for a specific user. (Requires admin privileges)
 * @param userId The ID of the user.
 * @returns {Promise<User>} The user details.
 */
export const fetchUserDetailsById = async (userId: string | number): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error fetching user details: ${response.statusText}` }));
    throw new Error(errorData.message || `Error fetching user details: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Updates a user's data. (Requires admin privileges)
 * @param userId The ID of the user to update.
 * @param userData The data to update.
 * @returns {Promise<User>} The updated user data from the backend.
 */
export const updateUserById = async (userId: string | number, userData: UpdateUserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH", // or PUT
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let errorMessage = "Ocurrió un error al actualizar el usuario.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || (errorData.errors && errorData.errors[0]?.msg) || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return await response.json(); // Assuming backend returns the updated user
};