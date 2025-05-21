
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Asegúrate que la ruta sea correcta
import { fetchAuthStatus } from "../../../lib/helpers"; // Import the new helper function
import Spinner from "@/components/ui/spinner"; // Asumiendo que tienes un componente Spinner

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuthStatus, setIsLoadingAuthStatus] = useState(true);

  useEffect(() => {
    const verifyUserAuthentication = async () => {
      setIsLoadingAuthStatus(true);
      try {
        const authData = await fetchAuthStatus();
        setIsAuthenticated(authData);
      } catch (error) {
        // Errors (network, unexpected HTTP, parsing) are logged by fetchAuthStatus.
        // The component ensures the UI reflects an unauthenticated state on any error.
        console.error("Failed to verify authentication status in Home component:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuthStatus(false);
      }
    };

    verifyUserAuthentication();
  }, []);

  return (
    <>
      {/* Fondo para móviles: textura1.jpg cubriendo el área. Fondo para md y superiores: noticias-home.jpg contenido. */}
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[url('/textura1.jpg')] bg-cover bg-center md:bg-[url('/noticias-home.jpg')] md:bg-contain md:bg-no-repeat md:bg-center">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12" style={{ background:"transparent" }}>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Bienvenido a Nuestra Plataforma
            </h1>
            <p className="font-semibold text-gray-800 dark:text-white text-lg md:text-xl mb-8">
              Somos una empresa dedicada a ofrecer soluciones innovadoras para tus necesidades.
              Nuestro equipo está comprometido con la excelencia y la satisfacción de nuestros clientes.
            </p>
          </div>

          <div className="mt-10 mb-12 h-16 flex items-center justify-center"> {/* Contenedor para botones o spinner */}
            {isLoadingAuthStatus ? (
              <Spinner /> // Ajusta el tamaño y color según tu spinner
            ) : isAuthenticated ? (
              <Button asChild variant="ghost" className="w-2/5 py-3 text-lg bg-blue-200" size="lg">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <Button asChild variant="ghost" className="w-full py-3 text-lg bg-blue-200" size="lg">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full py-3 text-lg bg-blue-200" size="lg">
                  <Link to="/register">Registro</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sección de Características (mantenida como en el ejemplo anterior) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m0-10.039V12m0 4.039V14m5.96-7.96l-1.414 1.414M4.04 15.96l1.414-1.414m0-8.486l-1.414-1.414m12.728 0l-1.414 1.414" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Innovación</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Utilizamos tecnología de punta para ofrecerte las mejores soluciones.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-green-500 text-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697A9.009 9.009 0 003 12c0 1.63.425 3.166 1.198 4.5H3a1 1 0 00-1 1v3a1 1 0 001 1h3.5M21 12a8.962 8.962 0 00-2.035-5.632M17.5 19H21a1 1 0 001-1v-3a1 1 0 00-1-1h-1.802A9.008 9.008 0 0015 3.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Calidad</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Nos esforzamos por ofrecer productos y servicios de la más alta calidad.
                </p>
              </div>
            </div>
             {/* Puedes añadir más características aquí si lo deseas */}
             
            {/* Nuevas Características */}
            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-purple-500 text-white p-3 rounded-full">
                {/* Icono de Soporte 24/7 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Soporte 24/7</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Nuestro equipo de soporte está disponible para ayudarte en cualquier momento.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-red-500 text-white p-3 rounded-full">
                {/* Icono de Seguridad Avanzada */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Seguridad Avanzada</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Protegemos tus datos con los más altos estándares de seguridad.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-indigo-500 text-white p-3 rounded-full">
                {/* Icono de Integración Fácil */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Integración Fácil</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Conéctate sin problemas con tus herramientas y servicios existentes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-transparent dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 bg-teal-500 text-white p-3 rounded-full">
                {/* Icono de Escalabilidad */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Escalabilidad</h3>
                <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">
                  Nuestra plataforma crece contigo, adaptándose a tus necesidades futuras.
                </p>
              </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Home
