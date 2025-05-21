import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchAuthStatus } from '../../../lib/helpers'; // Ajusta la ruta si es necesario
import { Loader2 } from 'lucide-react'; // O tu componente Spinner preferido
import { toast } from 'react-hot-toast';

const ProtectedRoutes = () => {
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const location = useLocation();
  
    useEffect(() => {
      const checkAuth = async () => {
        setIsAuthChecking(true);
        try {
          const isAuthenticated = await fetchAuthStatus();
          setIsUserAuthenticated(isAuthenticated);
          if (!isAuthenticated) {
            // Solo mostramos el toast si no estamos ya en /login para evitar redundancia
            if (location.pathname !== "/login") {
              toast.error("Acceso denegado. Debes iniciar sesión.");
            }
          }
        } catch (error) {
          console.error("Error en ProtectedRoute al verificar autenticación:", error);
          toast.error("Error al verificar tu sesión. Por favor, intenta iniciar sesión de nuevo.");
          setIsUserAuthenticated(false); // Asegura la redirección en caso de error
        } finally {
          setIsAuthChecking(false);
        }
      };
      checkAuth();
    }, [location.pathname]); // Volver a verificar si la ruta cambia, aunque fetchAuthStatus suele ser la clave
  
    if (isAuthChecking) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Verificando acceso...</p>
        </div>
      );
    }
  
    return isUserAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
  };
  

export default ProtectedRoutes
