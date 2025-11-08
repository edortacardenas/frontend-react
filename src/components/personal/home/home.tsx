import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion, Variants, cubicBezier } from "framer-motion";
import { Button } from "@/components/ui/button"; // Asegúrate que la ruta sea correcta
//import { fetchAuthStatus } from "../../../lib/helpers"; // Import the new helper function
import { useAuth } from "@/context/AuthContext";
import { MarqueeSection } from "@/components/news/MarqueeSection";
import { Globe } from "@/components/Globe";

// Array de características sin cambios
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
];

const Home = () => {
  const { isAuthenticated } = useAuth(); // Usa el contexto

  useEffect(() => {
   
  }, [isAuthenticated]);

  // -- ANIMATION VARIANTS --

  // Variante para contenedores que orquestan animaciones de sus hijos
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Variante para elementos individuales (texto, botones, etc.)
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: cubicBezier(0.42, 0, 0.58, 1),
      },
    },
  };

  // Variante específica para las tarjetas, con efecto "spring"
  const cardVariants: Variants = {
    hidden: {
      y: 50,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <main className="h-screen w-full bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white overflow-x-hidden p-4">
      {/* Hero Section */}
      <section className="flex pt-14 pb-12 ">
        <motion.div
          className="flex flex-col-reverse gap-12 items-center md:grid md:grid-cols-2 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {/* --- Text Content --- */}
            <motion.div
              className="text-center md:text-left"
              variants={itemVariants} // Este contenedor se animará como un solo item
            >
              <h1 className="text-4xl mb-3 ml-3 font-extrabold md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-[#d4dbff] to-[#0147ae] ">
               Bienvenido a Nuestra Plataforma 
              </h1>
              <p className="bg-clip-text text-[#d4dbff] mb-8 ml-4 text-lg md:text-xl">
                Nos especializamos en proveer la información más actual y relevante a nivel global. Nuestro equipo está comprometido con la excelencia y la satisfacción de nuestros lectores.
              </p>
              <div className="px-3 flex justify-center md:justify-start gap-4">
                {isAuthenticated ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-2/5">
                    <Button asChild variant="ghost" className="rounded-full px-8 py-6 text-lg text-[#d4dbff] bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90" size="lg">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button asChild variant="ghost" className="rounded-full px-8 py-6 text-lg text-[#d4dbff] bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90" size="lg">
                        <Link to="/login">Get Started</Link>
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* --- Globe Visualization --- */}
          <motion.div 
            className="flex items-center justify-center w-full h-full" 
            variants={itemVariants}
          >
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4dbff]/30 to-[#0147ae]/30 rounded-full blur-3xl"></div>
              {/* 3. REEMPLAZA EL CANVAS CON EL COMPONENTE GLOBE */}
              <div className="relative z-10 w-full h-full">
                <Globe />
              </div>
            </div>
          </motion.div>
        </motion.div>
       
      </section>

      {/* Features Section */}
      <section className="py-2 px-4">
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants} // Usamos el container para orquestar las tarjetas
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex cursor-pointer items-start space-x-8 rounded-xl bg-[#0147ae]/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:bg-gray-700/40"
              variants={cardVariants} // Cada tarjeta usa su propia variante
            >
              <div className={`flex-shrink-0 ${feature.bgColor} text-[#d4dbff] p-3 rounded-full`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-clip-text text-[#d4dbff]">{feature.title}</h3>
                <p className="font-semibold bg-clip-text text-[#d4dbff] mt-1">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <MarqueeSection />
    </main>
  );
};

export default Home;