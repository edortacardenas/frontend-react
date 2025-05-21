import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { checkNewsApiConnectionFetch } from "../../../services/newsService"; // Asegúrate que la ruta sea correcta
import { Loader2, Trash2, Edit3, UserCog, Users, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  //DialogTrigger, // Necesario si el botón de abrir está fuera del control directo del estado
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Para los campos del formulario
import { Label } from "@/components/ui/label"; // Para las etiquetas del formulario
import { Checkbox } from "@/components/ui/checkbox"; // Para el campo isAdmin
import {
  fetchAuthStatus,
  logoutUser,
  fetchAdminRole, // You might not need this if fetchAuthStatus provides isAdmin
  fetchAllUsers,
  deleteUserById,
  fetchUserDetailsById,
  updateUserById,
  Role, // Import from helpers
  User, // Import from helpers
  UpdateUserFormData // Import from helpers
} from "../../../lib/helpers";

const Dashboard = () => {
  const navigate = useNavigate(); // Hook para redirigir
  const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para el rol de admin
  const [isLoadingAdminStatus, setIsLoadingAdminStatus] = useState(true); // Estado de carga para el rol
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [currentUserToUpdate, setCurrentUserToUpdate] = useState<User | null>(null);
  const [updateUserFormData, setUpdateUserFormData] = useState<UpdateUserFormData>({ name: "", email: "", role: Role.USER });
  const [isLoadingCurrentUserDetails, setIsLoadingCurrentUserDetails] = useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  // Initial authentication check
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsInitialAuthLoading(true);
      try {
        // Asumimos que fetchAuthStatus() devuelve: Promise<boolean>
        const isAuthenticated = await fetchAuthStatus();
        if (isAuthenticated) {
          setIsUserAuthenticated(true);
          // El rol de admin se obtendrá en el siguiente useEffect
        } else {
          toast.error("Acceso denegado. Por favor, inicia sesión.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking authentication status for dashboard:", error);
        toast.error("Error al verificar autenticación. Redirigiendo al login.");
        navigate("/login");
      } finally {
        setIsInitialAuthLoading(false);
      }
    };
    checkAuthentication();
  }, [navigate]);

  const handlelogout = async () => {
    try {
      await logoutUser();
      toast.success("Sesión cerrada exitosamente.");
      setIsUserAuthenticated(false); // Update local auth state
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar sesión.");
      console.error("Error en la solicitud de logout:", error);
      // Optionally, if logout fails due to auth issues, still redirect
      if (error.message && (error.message.includes("401") || error.message.includes("failed"))) {
        navigate("/login");
      }
    }
  }

  
  const handlehome = () => {
    navigate("/");
  }

  useEffect(() => {
    // Fetch admin status only if authenticated.
    // isLoadingAdminStatus se usa para evitar múltiples llamadas si ya se está cargando o ya se cargó.
    if (!isUserAuthenticated || !isLoadingAdminStatus) {
      return;
    }

    const fetchAdminStatus = async () => {
      // setIsLoadingAdminStatus(true); // This line is redundant due to the effect's guard condition.
      // If the effect proceeds, isLoadingAdminStatus is already true.
      try {
        // This check is only truly necessary if fetchAuthStatus doesn't return isAdmin
        // or if you need to re-verify admin status independently.
        const isAdminUser = await fetchAdminRole();
        setIsAdmin(isAdminUser);
      } catch (error: any) {
        console.error("Error fetching admin status:", error);
        setIsAdmin(false); // Asumir no admin en caso de error de red
        toast.error(error.message || "Error al verificar estado de administrador.");
        if (error.message && error.message.includes("401")) {
          setIsUserAuthenticated(false); // Si obtener el rol de admin da 401, el usuario ya no está autenticado
          navigate("/login"); // If fetching admin status results in 401, user is no longer auth
        }
      } finally {
        setIsLoadingAdminStatus(false);
      }
    };
    fetchAdminStatus();
  }, [isUserAuthenticated, isLoadingAdminStatus, navigate]);

  const handleViewNews = async () => {
    setIsCheckingConnection(true);
    try {
      const isConnected = await checkNewsApiConnectionFetch();
      if (isConnected) {
        toast.success("Conexion exitosa "); // Mensaje exacto solicitado
        navigate("/noticias", { state: { connectionSuccess: true } });
      } else {
        // El toast de error se mostrará en la página de noticias.
        // Navegamos y pasamos el estado de error.
        navigate("/noticias", { 
          state: { 
            connectionSuccess: false, 
            errorMessage: "Conexion fallida ocurrio un error" // Mensaje exacto solicitado
          } 
        });
      }
    } catch (error) { // Error en la propia función checkNewsApiConnectionFetch
      console.error("Error durante la comprobación de conexión API:", error);
      // Navegar a noticias indicando el fallo
      navigate("/noticias", { state: { connectionSuccess: false, errorMessage: "Conexion fallida ocurrio un error" } });
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "No se pudieron cargar los usuarios.");
      if (error.message && error.message.includes("401")) navigate("/login");
      setUsers([]); // Limpiar usuarios en caso de error
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleOpenUsersModal = () => {
    if (isAdmin) {
      setIsUsersModalOpen(true);
      fetchUsers(); // Cargar usuarios cuando se abre el modal
    } else {
      toast.error("No tienes permisos para acceder a esta sección.");
    }
  };

  const handleDeleteUser = async (userId: string | number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con nombre ${name} ?`)) {
      return;
    }
    try {
      await deleteUserById(userId);
      toast.success(`Usuario ${name} eliminado correctamente.`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); // Actualizar UI
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "No se pudo eliminar el usuario.");
      if (error.message && error.message.includes("401")) navigate("/login");
    }
  };

  const openUpdateUserModal = async (user: User) => {
    setCurrentUserToUpdate(user);
    setIsLoadingCurrentUserDetails(true);
    setIsUpdateUserModalOpen(true);
    try {
      const userData = await fetchUserDetailsById(user.id);
      setUpdateUserFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role, 
      });
    } catch (error: any) {
      console.error("Error fetching user details for update:", error);
      toast.error(error.message || "No se pudieron cargar los detalles del usuario.");
      if (error.message && error.message.includes("401")) navigate("/login");
      // Considerar cerrar el modal si la carga falla críticamente
      // setIsUpdateUserModalOpen(false); 
      // setCurrentUserToUpdate(null);
    } finally {
      setIsLoadingCurrentUserDetails(false);
    }
  };

  const handleUpdateFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUpdateUserFormData(prev => ({
      ...prev,
      // Si es un checkbox, usa 'checked', de lo contrario usa 'value'
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitUpdateUser = async () => {
    if (!currentUserToUpdate) return;

    // Validaciones
    if (!updateUserFormData.name.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!updateUserFormData.email.trim() || !emailRegex.test(updateUserFormData.email)) {
      toast.error("Por favor, introduce un email válido.");
      return;
    }

    setIsSubmittingUpdate(true);
    try {
      const updatedUserData = {
        name: updateUserFormData.name,
        email: updateUserFormData.email,
        role: updateUserFormData.role,
      };
      await updateUserById(currentUserToUpdate.id, updatedUserData);
      toast.success("Usuario actualizado correctamente");
      setIsUpdateUserModalOpen(false);
      fetchUsers(); // Refrescar la lista de usuarios
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Ocurrió un error al actualizar el usuario.");
      if (error.message && error.message.includes("401")) navigate("/login");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  if (isInitialAuthLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /> <p className="ml-4 text-lg">Verificando autenticación...</p></div>;
  }

  if (!isUserAuthenticated) {
    // This case should ideally be handled by the redirect in the initial useEffect,
    // but as a fallback or if navigation is slow:
    return <div className="flex justify-center items-center min-h-screen"><p className="text-lg text-gray-700 dark:text-gray-300">No autenticado. Redirigiendo al login...</p></div>;
  }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 bg-contain bg-no-repeat bg-center" 
      style={{ backgroundImage: "url('/noticias-home.jpg')" }}
        >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          {/* Contenedor principal del encabezado: flex-col en móvil, md:flex-row en escritorio */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            {/* Sección de título y subtítulo: centrado en móvil, alineado a la izquierda en md+ */}
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Bienvenido a tu panel de control</p>
            </div>
            {/* Sección de botones: fila centrada en móvil, alineada a la derecha en md+ */}
            <div className="flex flex-row items-center justify-center md:justify-end space-x-2 md:space-x-3">
              <Button variant="outline" onClick={handlehome}>
                  Home
              </Button>
              <Button variant="destructive" onClick={handlelogout}>
                  Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          {
            isAdmin && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  Usuarios
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">Administra los usuarios registrados.</p>
                <Button 
                  variant="ghost" 
                  className="mt-4 w-full" 
                  onClick={handleOpenUsersModal}
                  disabled={!isAdmin || isLoadingAdminStatus}
                >
                  {isLoadingAdminStatus ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</>
                  ) : "Ver Usuarios"}
                  
                </Button>
              </CardContent>
          </Card>)
          }
          

          {/* Card 2 */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Noticias
              </CardTitle>
              <UserCog className="h-5 w-5 text-muted-foreground" /> {/* Icono placeholder */}
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">Consulta las noticias de ultimo momento.</p>
              <Button variant="ghost" className="mt-4 w-full" onClick={handleViewNews} disabled={isCheckingConnection}>
                {isCheckingConnection ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                ) : (
                  "Ver Noticias"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Configuración
              </CardTitle>
              <UserCog className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">Personaliza las configuraciones de tu cuenta.</p>
              <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate("/config")}>
                Configurar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal para administrar usuarios */}
        <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
          <DialogContent className="sm:max-w-[625px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Administrar Usuarios</DialogTitle>
              <DialogDescription>
                This action show all the users register in the application
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
                </div>
              ) : users.length > 0 ? (
                <ul className="space-y-3">
                  {users.map((user) => (
                    <li 
                      key={user.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm"
                    >
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openUpdateUserModal(user)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-600"
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Actualizar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id, user.name )}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No hay usuarios para mostrar o no se pudieron cargar.</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para actualizar usuario */}
        <Dialog open={isUpdateUserModalOpen} onOpenChange={(isOpen) => {
          setIsUpdateUserModalOpen(isOpen);
          if (!isOpen) {
            setCurrentUserToUpdate(null);
            setUpdateUserFormData({ name: "", email: "", role: Role.USER }); // Reset form, incluyendo role
          }
        }}>
          <DialogContent className="sm:max-w-[525px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                Actualizar Usuario: {currentUserToUpdate?.name}
              </DialogTitle>
              <DialogDescription>
                Modifica los datos del usuario. Los cambios se guardarán al hacer clic en "Aceptar".
              </DialogDescription>
            </DialogHeader>
            {isLoadingCurrentUserDetails ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-gray-600 dark:text-gray-300">Cargando datos del usuario...</p>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right col-span-1 dark:text-gray-300">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={updateUserFormData.name}
                    onChange={handleUpdateFormInputChange}
                    className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    disabled={isSubmittingUpdate}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right col-span-1 dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={updateUserFormData.email}
                    onChange={handleUpdateFormInputChange}
                    className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    disabled={isSubmittingUpdate}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right col-span-1 dark:text-gray-300">
                    Admin
                  </Label>
                  <div className="col-span-3 flex items-center"> {/* Contenedor para alinear el checkbox */}
                    <Checkbox
                      id="role"
                      name="role"
                      checked={updateUserFormData.role === Role.ADMIN}
                      onCheckedChange={(checkedStatus) => { // Específico de shadcn/ui Checkbox
                        setUpdateUserFormData(prev => ({ 
                          ...prev, 
                          role: checkedStatus ? Role.ADMIN : Role.USER }));
                      }}
                      disabled={isSubmittingUpdate} />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingUpdate}>Cancelar</Button></DialogClose>
              <Button type="button" onClick={handleSubmitUpdateUser} disabled={isLoadingCurrentUserDetails || isSubmittingUpdate}>
                {isSubmittingUpdate ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Aceptar</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;