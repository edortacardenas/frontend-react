import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Shadcn Form components
import { fetchAuthStatus } from "../../../lib/helpers"; // Ajusta la ruta si es necesario
import { Loader2 } from "lucide-react"; // O tu componente Spinner preferido

// Zod Schema for password validation
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "La contraseña anterior es requerida." }),
  newPassword: z.string()
    .min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres." })
    .regex(/[a-z]/, { message: "Debe contener al menos una letra minúscula." })
    .regex(/[A-Z]/, { message: "Debe contener al menos una letra mayúscula." })
    .regex(/[0-9]/, { message: "Debe contener al menos un número." })
    .regex(/[^a-zA-Z0-9]/, { message: "Debe contener al menos un carácter especial (ej. !@#$%^&*)." }),
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const Config = () => {
  const navigate = useNavigate()
  //const [isAuthChecking, setIsAuthChecking] = useState(true);
  //const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"update" | "delete">("update");

  /*useEffect(() => {
    const checkAuthentication = async () => {
      setIsAuthChecking(true);
      try {
        const isAuthenticated = await fetchAuthStatus();
        if (isAuthenticated) {
          setIsUserAuthenticated(true);
        } else {
          toast.error("Acceso denegado. Debes iniciar sesión.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error al verificar autenticación en Config:", error);
        toast.error("Error al verificar tu sesión. Por favor, intenta iniciar sesión de nuevo.");
        navigate("/login");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuthentication();
  }, []);
  

  
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">Verificando acceso...</p>
      </div>
    );
  }

  if (!isUserAuthenticated) {
    // Aunque el useEffect ya redirige, esto es una guarda adicional
    // o para el caso en que la navegación aún no haya completado.
    return null; 
  }
  */

  // Cargar datos del perfil al abrir el modal de actualización
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluye cookies en la solicitud
      });

      if (response.ok) {
        const data = await response.json();
        setProfileFormData({ name: data.name, email: data.email });
      } else {
        toast.error("Error al cargar los datos del perfil");
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
      toast.error("Error al cargar los datos del perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData({ ...profileFormData, [name]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluye cookies en la solicitud
        body: JSON.stringify(profileFormData),
      });

      if (response.ok) {
        toast.success("Perfil actualizado con éxito");
        setIsProfileModalOpen(false);
      } else {
        toast.error("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluye cookies en la solicitud
      });

      if (response.status === 200) {
        toast.success("Perfil eliminado con éxito");
        setIsProfileModalOpen(false);
        navigate("/register"); // Redirige al login después de eliminar el perfil
      } else {
        const data = await response.json();
        toast.error(data.msg || "Error al eliminar el perfil");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error("Error al eliminar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = async (type: "update" | "delete") => {
    setModalType(type);
    setIsProfileModalOpen(true);

    if (type === "update") {
      await loadProfileData(); // Cargar datos del perfil al abrir el modal de actualización
    } else if (type === "delete") {
      await loadProfileData(); // Cargar datos del perfil para mostrarlo antes de eliminar
    }
  };

  const closeModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleCancelAndRedirect = () => {
    setIsProfileModalOpen(false);
    navigate("/dashboard");
  }

  // --- Logic for Change Password Modal ---
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleChangePasswordSubmit = async (formData: ChangePasswordFormData) => {
    // react-hook-form's isSubmitting will be true here
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluye cookies en la solicitud
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Contraseña cambiada exitosamente");
        passwordForm.reset();
        setIsChangePasswordModalOpen(false);
      } else {
        const errorData = await response.json();
        // Verificar si el error es por registro OAuth
        if (response.status === 400 && errorData.msg && errorData.msg.toLowerCase().includes("proveedor externo")) {
          toast.error("Tienes que crearte una cuenta con usuario y contraseña estas registrado usando un proveedor externo (ej. Google).");
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Mostrar el primer error de validación del backend
          toast.error(errorData.errors[0].msg || "Error al cambiar la contraseña.");
        } else {
          toast.error(errorData.msg || "Error al cambiar la contraseña.");
        }
        // Si quieres ver todos los errores de validación en la consola:
        if (errorData.errors) {
          console.error("Errores de validación del backend:", errorData.errors);
        }
      }
    } catch (error) {
      console.error("Error en la solicitud de cambio de contraseña:", error);
      toast.error("Error cambiando contraseña. Inténtalo de nuevo.");
    }
    // react-hook-form's isSubmitting will automatically turn false
    // No es necesario un setIsLoading manual aquí si se usa el estado de react-hook-form
    // para deshabilitar el botón de envío.
  };

  const handleCancelChangePassword = () => {
    passwordForm.reset();
    setIsChangePasswordModalOpen(false);
    navigate("/config"); // Redirige a /config (o simplemente cierra el modal)
  };

  const handlePasswordModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) passwordForm.reset();
    setIsChangePasswordModalOpen(isOpen);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[url('/textura1.jpg')] bg-cover bg-center md:bg-[url('/noticias-home.jpg')] md:bg-cover md:bg-no-repeat md:bg-center">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuración de Perfil</h2>
        <div className="space-y-4">
          <Button onClick={() => openModal("update")} className="w-full">
            Actualizar Perfil
          </Button>
          <Button onClick={() => openModal("delete")} variant="destructive" className="w-full">
            Eliminar Perfil
          </Button>
          <Button onClick={() => setIsChangePasswordModalOpen(true)} variant="outline" className="w-full">
            Cambiar contraseña
          </Button>
          <Button  onClick={handleCancelAndRedirect} variant="default" className="w-full">
            Cancelar
          </Button>
        </div>
      </div>

      {/* Modal para Actualizar/Eliminar Perfil */}
      <Dialog open={isProfileModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "update" ? "Actualizar Perfil" : "Eliminar Perfil"}
            </DialogTitle>
            <DialogDescription>
              {modalType === "update"
                ? "Actualiza los datos de tu perfil en el formulario a continuación."
                : "Confirma si deseas eliminar tu perfil. Esta acción no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          {modalType === "update" ? (
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={profileFormData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleInputChange}
                  placeholder="Tu correo electrónico"
                  required
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div>
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar el siguiente perfil?
              </p>
              <p className="text-gray-800 font-semibold">Nombre: {profileFormData.name}</p>
              <p className="text-gray-800 font-semibold">Correo: {profileFormData.email}</p>
              <DialogFooter>
                <Button onClick={handleDelete} variant="destructive" disabled={isLoading}>
                  {isLoading ? "Eliminando..." : "Eliminar Perfil"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Cambiar Contraseña */}
      <Dialog open={isChangePasswordModalOpen} onOpenChange={handlePasswordModalOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Introduce tu contraseña anterior y elige una nueva contraseña segura.
              La nueva contraseña debe cumplir con los requisitos mínimos.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleChangePasswordSubmit)} className="space-y-4 py-4">
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="oldPassword">Contraseña anterior</FormLabel>
                    <FormControl>
                      <Input id="oldPassword" type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newPassword">Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input id="newPassword" type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={handleCancelChangePassword}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Config;