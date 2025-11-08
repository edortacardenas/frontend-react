// src/components/ui/Globe.tsx

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// Este componente encapsula toda la lógica del globo terráqueo.
// Se adaptará automáticamente al tamaño de su contenedor.
export const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0); // Usamos useRef para persistir el valor de la rotación entre renders

  useEffect(() => {
    // Asegurarse de que el canvas exista y la inicialización no se duplique
    if (!canvasRef.current) return;

    let width = 0;
    // Función para manejar el redimensionamiento del canvas
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        // Ajustamos la resolución del canvas para pantallas de alta densidad (Retina)
        canvasRef.current.width = width * 2;
        canvasRef.current.height = width * 2;
      }
    };

    window.addEventListener('resize', onResize);
    onResize(); // Llamamos una vez al inicio para establecer el tamaño inicial

    // Inicializamos la instancia de cobe con la configuración que ya tenías
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.2, // Le damos una ligera inclinación para un mejor efecto visual
      dark: 1,
      diffuse: 1.2,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.9],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.3, 0.7, 0.9],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6762, 139.6503], size: 0.05 },
        { location: [22.3193, 114.1694], size: 0.03 },
        { location: [-33.8688, 151.2093], size: 0.03 },
      ],
      // La función onRender se ejecuta en cada frame de la animación
      onRender: (state) => {
        state.phi = rotationRef.current;
        rotationRef.current += 0.005; // Incrementamos la rotación
      },
    });

    // Función de limpieza: se ejecuta cuando el componente se desmonta.
    // Es crucial para prevenir fugas de memoria.
    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez (al montar el componente)

  return (
    <canvas
      ref={canvasRef}
      // El estilo asegura que el canvas ocupe el 100% de su contenedor padre.
      // Su tamaño real en píxeles se gestiona en el useEffect.
      style={{ width: '100%', height: '100%', aspectRatio: '1 / 1' }}
    />
  );
};