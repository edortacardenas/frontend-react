import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Checkbox } from "@/components/ui/checkbox"; 
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, Edit3, UserCog, Users, Save, Newspaper, Settings, LogOut, UserCheck, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext'; // 1. Importa el hook useAuth

import { fetchAdminRole, fetchAllUsers, deleteUserById, fetchUserDetailsById, updateUserById, Role, User, UpdateUserFormData } from "../../../lib/helpers";

// Importa Recharts
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';



// --- SUB-COMPONENTE: GRÁFICO DE ROLES ---
const UserRolePieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#0088FE', '#00C49F']; // Azul para Admin, Verde para User
  return (
    <div style={{ width: '120%', height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ percent }) => ` ${((percent as number) * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- SUB-COMPONENTE: TARJETAS DE ESTADÍSTICAS ---
const DashboardStats = ({ total, admins, users }: { total: number; admins: number; users: number }) => (
  <div className="grid gap-6 md:grid-cols-3">
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <p className="text-xs text-muted-foreground">Usuarios registrados en el sistema</p>
      </CardContent>
    </Card>
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
        <UserCog className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{admins}</div>
        <p className="text-xs text-muted-foreground">Cuentas con privilegios elevados</p>
      </CardContent>
    </Card>
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Usuarios Estándar</CardTitle>
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{users}</div>
        <p className="text-xs text-muted-foreground">Cuentas con permisos regulares</p>
      </CardContent>
    </Card>
  </div>
);

const Dashboard = () => {
  const { logout } = useAuth(); // 2. Obtén la función logout del contexto
  const navigate = useNavigate(); // Hook para redirigir
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
  const [isPageLoaded, setIsPageLoaded] = useState(false); // Estado para la animación de carga de página

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "No se pudieron cargar los usuarios.");
      } else {
        toast.error("No se pudieron cargar los usuarios.");
      }
      if (error instanceof Error && error.message?.includes("401")) navigate("/login");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // --- LÓGICA DE DATOS Y EFECTOS ---
  
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const isAdminUser = await fetchAdminRole();
        setIsAdmin(isAdminUser);
        if (isAdminUser) {
          fetchUsers(); // Cargar usuarios si es admin
        }
      } catch (error: unknown) {
        console.error("Error fetching admin status:", error);
        if (error instanceof Error && error.message?.includes("401")) navigate("/login");
      } finally {
        setIsLoadingAdminStatus(false);
      }
    };
    fetchAdminStatus();
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  

  // --- MEMOIZACIÓN PARA CÁLCULOS ---

  const userStats = useMemo(() => {
    const adminCount = users.filter(u => u.role === Role.ADMIN).length;
    return {
      total: users.length,
      admins: adminCount,
      users: users.length - adminCount,
    };
  }, [users]);

  const chartData = useMemo(() => [
    { name: 'Admin', value: userStats.admins },
    { name: 'User', value: userStats.users },
  ], [userStats]);

  // --- MANEJADORES DE EVENTOS ---
  
  const handleLogout = async () => {
    // La lógica ahora es mucho más simple y declarativa.
    await logout(); // Esto se encarga de la API y de actualizar el estado global.
    toast.success("Sesión cerrada exitosamente.");
    navigate("/"); // Redirige al home.
  };
  
  const handleDeleteUser = async (userId: string | number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con nombre ${name} ?`)) {
      return;
    }
    try {
      await deleteUserById(userId);
      toast.success(`Usuario ${name} eliminado correctamente.`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); // Actualizar UI
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      if (error instanceof Error) {
        toast.error(error.message || "No se pudo eliminar el usuario.");
      } else {
        toast.error("No se pudo eliminar el usuario.");
      }
      if (error instanceof Error && error.message.includes("401")) navigate("/login");
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
    } catch (error: unknown) {
      console.error("Error fetching user details for update:", error);
      if (error instanceof Error) {
        toast.error(error.message || "No se pudieron cargar los detalles del usuario.");
      } else {
        toast.error("No se pudieron cargar los detalles del usuario.");
      }
      if (error instanceof Error && error.message.includes("401")) navigate("/login");
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
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Ocurrió un error al actualizar el usuario.");
      } else {
        toast.error("Ocurrió un error al actualizar el usuario.");
      }
      if (error instanceof Error && error.message.includes("401")) navigate("/login");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white overflow-x-hidden p-4">
      <div className={`
        w-full max-w-7xl mx-auto p-6 space-y-8 my-18
        bg-slate-100/70 dark:bg-slate-900/70 backdrop-blur-sm
        rounded-2xl shadow-xl border border-white/20
        transition-all duration-700 ease-out
        ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}>
        {/* Encabezado del Dashboard */}
        <header className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard de Control</h1>
            <p className="text-gray-600 dark:text-gray-300">Bienvenido, aquí tienes un resumen de la actividad.</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button className='bg-gradient-to-b from-blue-900 to-gray-900 hover:cursor-pointer' onClick={() => navigate("/")}><Home className="h-4 w-4"/>Home</Button>
            <Button className='bg-[#ff3f41] hover:text-[#ff3f41] hover:cursor-pointer' onClick={handleLogout}><LogOut className="h-4 w-4"/> Salir</Button>
          </div>
        </header>

        {/* Sección de Estadísticas (Solo para Admins) */}
        {isLoadingAdminStatus ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : isAdmin && (
          <DashboardStats total={userStats.total} admins={userStats.admins} users={userStats.users} />
        )}
        
        {/* Sección de Acciones Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAdmin && (
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:cursor-pointer" onClick={() => setIsUsersModalOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium" > Administrar Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Visualiza, edita y elimina usuarios del sistema.</p>
                <Button className="w-full">Gestionar</Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:cursor-pointer" onClick={() => navigate("/noticias")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium"> Ver Noticias</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Conéctate a la API y consulta las últimas noticias.</p>
              <Button className="w-full" >
                Ir a Noticias
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:cursor-pointer" onClick={() => navigate("/config")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium"> Configuración</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Ajusta la configuración de tu perfil y preferencias.</p>
              <Button className="w-full">Configurar Cuenta</Button>
            </CardContent>
          </Card>
        </div>

        {/* Modales (su JSX podría estar en sus propios componentes) */}
        <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
            <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Administrar Usuarios</DialogTitle>
                    <DialogDescription>Gestiona los usuarios registrados y visualiza las estadísticas de roles.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh]">
                    {/* Columna de Gráfico */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Distribución de Roles</h3>
                        {users.length > 0 ? <UserRolePieChart data={chartData} /> : <p>No hay datos para mostrar.</p>}
                    </div>
                    {/* Columna de Lista de Usuarios */}
                    <div className="overflow-y-auto pr-2">
                    {isLoadingUsers ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : users.length > 0 ? (
                        <ul className="space-y-3">
                        {users.map((user) => (
                            <li key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => openUpdateUserModal(user)}><Edit3 className="h-4 w-4"/></Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id, user.name)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : <p>No se encontraron usuarios.</p>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* El modal de actualización de usuario permanece sin cambios en su estructura interna */}
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