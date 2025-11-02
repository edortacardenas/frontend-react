'use client';


import { Menu } from 'lucide-react';

// Componentes de Shadcn/ui
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader, // <--- Importado
  SheetTitle,  // <--- Importado
  SheetTrigger,
} from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAuthStatus } from '@/lib/helpers';

export const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
      const verifyUserAuthentication = async () => {
        try {
          const authData = await fetchAuthStatus();
          setIsAuthenticated(authData);
        } catch (error) {
          console.error("Failed to verify authentication status in Home component:", error);
          setIsAuthenticated(false);
        } 
      };
  
      verifyUserAuthentication();
    }, []);

  return (
    <nav className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gradient-to-b from-[#0147ae] via-[#d4dbff] to-gray-900 text-white">
      <div className=" mx-auto flex h-6 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo y Nombre del Sitio */}
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hidden font-bold sm:inline-block">
            Noticias
          </span>
        </Link>

        {/* Navegación para Escritorio (Oculta en móvil) */}
        <div className="hidden items-center gap-4 md:flex">
        {isAuthenticated ? (
              <div  className="w-2/5">
                <Button asChild variant="ghost" className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90" size="lg">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div >
                  <Button asChild variant="ghost" className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90" size="lg">
                    <Link to="/login">Get Starter</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Menú Móvil (Visible solo en móvil) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 " />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gradient-to-b from-[#0147ae] via-[#d4dbff] to-gray-900 text-white">
              <SheetHeader className="text-right mb-4">
                <SheetTitle>
                <SheetTrigger asChild>
                   <Link to="/" className="flex items-center gap-2">
                    <span className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b]">Home</span>
                  </Link>
                  </SheetTrigger>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4">
                
                  <div className="grid grid-cols-1 gap-4">
                  {isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild variant="ghost" className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'w-full rounded-full bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90 px-8 py-6 text-lg' })}>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    </SheetTrigger>
                    }
                  </div>
                
                  <div className="grid grid-cols-1 gap-4">
                    {!isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild variant="ghost" className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'w-full rounded-full bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90 px-8 py-6 text-lg' })}>
                      <Link to="/login">Register</Link>
                    </Button>
                    </SheetTrigger>
                    }
                  </div>
                
                  <div className="grid grid-cols-1 gap-4">
                  {!isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild variant="ghost" className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'w-full rounded-full bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90 px-8 py-6 text-lg' })}>
                      <Link to="/login">Login</Link>
                    </Button>
                    </SheetTrigger>
                  }
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild variant="ghost" className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'w-full rounded-full bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:opacity-90 px-8 py-6 text-lg' })}>
                      <Link to="/noticias">News</Link>
                    </Button>
                    </SheetTrigger>
                    }
                  </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>
    </nav>
  );
};