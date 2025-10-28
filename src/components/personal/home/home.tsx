import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cubicBezier } from "framer-motion";
import { Variants } from "framer-motion";
import { Button } from "@/components/ui/button"; // Asegúrate que la ruta sea correcta
import { fetchAuthStatus } from "../../../lib/helpers"; // Import the new helper function
import Spinner from "@/components/ui/spinner"; // Asumiendo que tienes un componente Spinner

const features = [
  {
    title: "Innovación",
    description: "Utilizamos tecnología de punta para ofrecerte las noticias de último momento.",
    bgColor: "bg-blue-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m0-10.039V12m0 4.039V14m5.96-7.96l-1.414 1.414M4.04 15.96l1.414-1.414m0-8.486l-1.414-1.414m12.728 0l-1.414 1.414" />
      </svg>
    ),
  },
  {
    title: "Líderes",
    description: "Somos líderes en la difusión de noticias de último momento, conectando al mundo con la información que importa.",
    bgColor: "bg-green-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697A9.009 9.009 0 003 12c0 1.63.425 3.166 1.198 4.5H3a1 1 0 00-1 1v3a1 1 0 001 1h3.5M21 12a8.962 8.962 0 00-2.035-5.632M17.5 19H21a1 1 0 001-1v-3a1 1 0 00-1-1h-1.802A9.008 9.008 0 0015 3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
  },
  {
    title: "Soporte 24/7",
    description: "Nuestro equipo de soporte está disponible para asistirte con cualquier consulta sobre nuestra plataforma de noticias.",
    bgColor: "bg-purple-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Seguridad Avanzada",
    description: "Protegemos la integridad de nuestra información y la privacidad de nuestros lectores con los más altos estándares de seguridad.",
    bgColor: "bg-red-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Integración Fácil",
    description: "Integra fácilmente nuestras noticias en tus plataformas y servicios favoritos para mantenerte siempre al día.",
    bgColor: "bg-indigo-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    title: "Escalabilidad",
    description: "Nuestra cobertura informativa se expande y adapta continuamente para satisfacer tu creciente necesidad de estar bien informado.",
    bgColor: "bg-teal-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ),
  },
];

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuthStatus, setIsLoadingAuthStatus] = useState(true);
  const [rezizeglove, setRezizeGlove] = useState(1000);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
  
      // Ajusta el tamaño del globo dinámicamente en función del ancho de la ventana
      const newSize = width < 590 ? Math.floor(width * 1.50) : 1000;
  
      setRezizeGlove(newSize);
    };
  
    // Initial check
    handleResize();
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rezizeglove]);

  useEffect(() => {

    // This script tag will be added to the document to load and run the globe logic.
    const globeScript = document.createElement('script');
    globeScript.type = 'module';
    // We use textContent to inject the exact script from the original HTML.
    globeScript.textContent = `
      import createGlobe from 'https://cdn.skypack.dev/cobe';

      let phi = 0;
      let canvas = document.getElementById("cobe");

      // Check if canvas exists and hasn't been initialized yet to prevent duplicates on hot-reloads
      if (canvas && !canvas.getAttribute('data-globe-initialized')) {
        canvas.setAttribute('data-globe-initialized', 'true');
        
        const globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: ${rezizeglove},
          height: ${rezizeglove},
          phi: 0,
          theta: 0,
          dark: 0,
          diffuse: 1.2,
          scale: 1,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.3, 0.5, 0.8],
          markerColor: [0.9, 1, 0.8],
          glowColor:  [0.3, 0.7, 0.9] ,
          offset: [0, 0],
          markers: [
            { location: [37.7595, -122.4367], size: 0.03 },
            { location: [40.7128, -74.006], size: 0.1 },
            { location: [51.5074, -0.1278], size: 0.05 },
            { location: [35.6762, 139.6503], size: 0.05 },
            { location: [22.3193, 114.1694], size: 0.03 },
            { location: [-33.8688, 151.2093], size: 0.03 },
          ],
          onRender: (state) => {
            state.phi = phi;
            phi += 0.005;
          },
        });
      }
    `;
    
    document.body.appendChild(globeScript);

    // Cleanup function to remove the script when the component is unmounted.
    return () => {
      // It's tricky to remove module scripts reliably, but we can try.
      const scripts = document.querySelectorAll('script[type="module"]');
      scripts.forEach(s => {
        if (s.textContent && s.textContent.includes('createGlobe')) {
          s.remove();
        }
      });
      const canvas = document.getElementById("cobe");
      if (canvas) {
        canvas.removeAttribute('data-globe-initialized');
      }
    };
  }, [rezizeglove]); // Re-run effect when size change

  useEffect(() => {
    const verifyUserAuthentication = async () => {
      setIsLoadingAuthStatus(true);
      try {
        const authData = await fetchAuthStatus();
        setIsAuthenticated(authData);
      } catch (error) {
        console.error("Failed to verify authentication status in Home component:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuthStatus(false);
      }
    };

    verifyUserAuthentication();
  }, []);

  // Variantes de animación para orquestación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Aplica un retraso entre la animación de los hijos
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: cubicBezier(0.42, 0, 0.58, 1), // Usar cubicBezier para curvas personalizadas
      },
    },
  };

  const cardVariants: Variants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring", // Asegúrate de que este valor sea válido
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };



  return (
    <>
      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-2 lg:px-4 bg-[url('/noticias-home.webp')] bg-cover bg-center bg-no-repeat">
        <motion.div
          className="max-w-4xl w-full bg-white/10 dark:bg-gray-800/20 shadow-xl rounded-lg p-8 md:p-12 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6"
              variants={itemVariants}
            >
              Bienvenido a Nuestra Plataforma
            </motion.h1>
            <motion.p
              className="font-semibold text-gray-800 dark:text-white text-lg md:text-xl mb-8"
              variants={itemVariants}
            >
              Nos especializamos en proveer la información más actual y relevante a nivel global.
              Nuestro equipo está comprometido con la excelencia y la satisfacción de nuestros lectores.
            </motion.p>
          </div>

          <motion.div
            className="mt-10 mb-12 h-16 flex items-center justify-center"
            variants={itemVariants}
          >
            {isLoadingAuthStatus ? (
              <Spinner />
            ) : isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-2/5">
                <Button asChild variant="ghost" className="w-full py-3 text-lg bg-blue-200" size="lg">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="ghost" className="w-full py-3 text-lg bg-blue-200" size="lg">
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="ghost" className="w-full py-3 text-lg bg-blue-200" size="lg">
                    <Link to="/register">Registro</Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
           
          {/* Globe visualization */}
          <div className="flex justify-center items-center">
            <div className="relative max-w-[500px] aspect-square">
              <div className=" bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
              <canvas
                id="cobe"
                
                width="500"
                height="500"
                className="relative z-10 w-full h-full"
              ></canvas>
            </div>
          </div>
           

          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
          >
            {/* Aquí mapeamos las tarjetas para no repetir código */}
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex cursor-pointer items-start space-x-4 rounded-xl bg-white/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:bg-gray-700/40"
                variants={cardVariants}
              >
                {/* ... El contenido de tu tarjeta */}
                <div className={`flex-shrink-0 ${feature.bgColor} text-white p-3 rounded-full`}>
                  {feature.icon}
                  
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="font-semibold text-gray-900 dark:text-gray-400 mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;