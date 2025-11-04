import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { fetchAuthStatus, logoutUser as apiLogout } from '../lib/helpers'; // Renombramos logoutUser para evitar conflictos

// 1. Definir la interfaz para el valor del contexto.
//    Esto asegura que todos los componentes sepan qué funciones y valores están disponibles.
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // Añadimos un estado de carga para evitar parpadeos en la UI
  login: () => void;
  logout: () => Promise<void>;
}

// 2. Crear el contexto con un valor inicial undefined.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Crear el componente Proveedor que envolverá tu aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia en true mientras verificamos el estado inicial

  // 4. useEffect para verificar la autenticación solo UNA VEZ al cargar la aplicación.
  //    El array de dependencias vacío [] es CRUCIAL para que no se ejecute en cada cambio.
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await fetchAuthStatus();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error("Error verifying auth status:", error);
        setIsAuthenticated(false);
      } finally {
        // Una vez terminada la verificación, ponemos isLoading en false.
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // 5. Crear la función `login`. La envolvemos en useCallback para optimización.
  //    Esta función será llamada desde tu página de Login.
  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // 6. Crear la función `logout`.
  //    Esta función será llamada desde tu Dashboard o Navbar.
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // Llama a la función de la API para cerrar sesión en el backend.
      setIsAuthenticated(false); // Actualiza el estado en el frontend.
    } catch (error) {
      console.error("Logout failed:", error);
      // Aunque falle la API, forzamos el cierre de sesión en el frontend para consistencia.
      setIsAuthenticated(false);
    }
  }, []);

  // 7. El valor que proveeremos a todos los componentes hijos.
  const value = { isAuthenticated, isLoading, login, logout };

  // 8. Renderizar el proveedor con el valor y mostrar los componentes hijos solo cuando no esté cargando.
  //    Esto previene que se muestre brevemente el estado de "no logueado" al recargar la página si el usuario sí lo está.
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 9. Hook personalizado para consumir el contexto fácilmente y con seguridad.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};