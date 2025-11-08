// src/components/news/MarqueeSection.tsx

import React from "react"; // Necesario para React.cloneElement
import Marquee from "react-fast-marquee";

// --- Datos de logos de ejemplo (sin cambios) ---
const newsSources = [
  {
    name: "The New York Times",
    logo: (
      <svg viewBox="0 0 208 24" fill="currentColor">
        <path d="M103.5 23.6V.4h5.1v18.5h.2l8.8-18.5h5.8v23.2h-5.1V5.1h-.2l-8.8 18.5h-5.8zm-15.5 0V.4h11.2c6.1 0 9.8 3.8 9.8 9.2s-3.7 9.3-9.8 9.3H88zm5.1-5.2h4.9c3.1 0 4.7-1.8 4.7-4.1s-1.6-4.1-4.7-4.1h-4.9v8.2zM75.1 23.6V.4h5.1v23.2h-5.1zm-15.3 0L50.4 8.2h-.2V23.6h-5.1V.4h5.8l9.4 15.4h.2V.4h5.1v23.2h-5.8zM40.1 23.6V.4h5.1v23.2h-5.1zM26.6 5.1h-.2L17.1 23.6h-5.8L2.1.4h5.8l5.2 11.5h.2L18.4.4h5.8l-7.5 14.2.1.1 9.8 8.9v.1h-5.6zM137.9 23.6V.4h11.2c6.1 0 9.8 3.8 9.8 9.2s-3.7 9.3-9.8 9.3h-11.2zm5.1-5.2h4.9c3.1 0 4.7-1.8 4.7-4.1s-1.6-4.1-4.7-4.1h-4.9v8.2zM170.1 23.6l-9.3-13.3h-.2v13.3h-5.1V.4h5.8l8.7 12.7h.2V.4h5.1v23.2h-5.2zM208 23.6V.4h5.1v18.5h.2l8.8-18.5h5.8v23.2h-5.1V5.1h-.2l-8.8 18.5h-5.8z" />
      </svg>
    ),
  },
  {
    name: "BBC News",
    logo: (
      <svg viewBox="0 0 89 25" fill="currentColor">
        <path d="M0 0h25v25H0zM32 0h25v25H32zM64 0h25v25H64z" />
        <g fill="#FFF">
          <path d="M8.3 12.5c0-3.9 2.5-6 6.3-6 3.1 0 5.1 1.7 5.1 4.1 0 2.2-1.6 3.4-4.2 3.8l4.4 4.2h-5.4l-3.9-3.8h-1v3.8H8.3v-8.1zm2.3 2.1h1.1c2.1 0 3.3-1 3.3-2.5s-1.2-2.5-3.3-2.5h-1.1v5zM40.3 12.5c0-3.9 2.5-6 6.3-6 3.1 0 5.1 1.7 5.1 4.1 0 2.2-1.6 3.4-4.2 3.8l4.4 4.2h-5.4l-3.9-3.8h-1v3.8h-2.3v-8.1zm2.3 2.1h1.1c2.1 0 3.3-1 3.3-2.5s-1.2-2.5-3.3-2.5h-1.1v5zM72.3 12.5c0-3.9 2.5-6 6.3-6 3.1 0 5.1 1.7 5.1 4.1 0 2.2-1.6 3.4-4.2 3.8l4.4 4.2h-5.4l-3.9-3.8h-1v3.8h-2.3v-8.1zm2.3 2.1h1.1c2.1 0 3.3-1 3.3-2.5s-1.2-2.5-3.3-2.5h-1.1v5z" />
        </g>
      </svg>
    ),
  },
    {
    name: "Associated Press",
    logo: (
      <svg viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 0L0 100h25l12.5-31.25h25L75 100h25L50 0zm-6.25 56.25L50 18.75 56.25 56.25h-12.5z"/>
      </svg>
    ),
  },
  {
    name: "Reuters",
    logo: (
      <svg viewBox="0 0 200 40" fill="currentColor">
         <circle cx="20" cy="20" r="18" /><circle cx="20" cy="20" r="12" fill="#080d1b" />
         <text x="50" y="30" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold">REUTERS</text>
      </svg>
    ),
  },
];


export const MarqueeSection = () => {
  return (
    // SOLUCIÓN SCROLLBAR: 'overflow-hidden' aquí es clave para contener el marquee.
    <section className="relative w-full py-24 overflow-hidden">
      
      <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-r from-blue-900/10 via-transparent to-blue-500/10 blur-3xl" />
      
      <div className="container mx-auto px-4">
        

        <Marquee
          gradient={true}
          gradientColor={[8, 13, 27]}
          gradientWidth={150}
          speed={40}
          pauseOnHover={true}
          autoFill={true}
        >
          {newsSources.map((source, index) => (
            // Contenedor del "slot" de cada logo: define el tamaño y el espaciado.
            // Es un flexbox para centrar perfectamente su contenido.
            <div
              key={index}
              className="mx-12 h-20 w-48 flex items-center justify-center"
            >
              {/* SOLUCIÓN ALINEACIÓN: Clonamos el SVG para inyectarle clases de estilo */}
              {React.cloneElement(source.logo, {
                className:
                  "h-auto w-full max-h-12 text-[#d4dbff] transition-all duration-300 ease-out grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110",
              })}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};