import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Importa el hook useAuth
import { useEffect } from 'react';


export const Navbar = () => {
  const { isAuthenticated} = useAuth(); // Usa el contexto

  useEffect(() => {
    // Aquí podrías agregar lógica adicional si es necesario
  }, []);

  return (
    <nav className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gradient-to-b from-black  to-blue-900">
      <div className=" mx-auto flex h-6 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo y Nombre del Sitio */}
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff] hidden font-bold sm:inline-block">
            Noticias
          </span>
        </Link>

        {/* Navegación para Escritorio (Oculta en móvil) */}
        <div className="hidden items-center gap-4 md:flex">
        {isAuthenticated ? (
              <div  className="w-2/5">
                <Button asChild variant="ghost" className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]" size="lg">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className='flex '>
                  <Button asChild className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]" size="lg">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]" size="lg">
                      <Link to="/register">Register</Link>
                    </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Menú Móvil (Visible solo en móvil) */}
        <div className="md:hidden flex justify-end">
          <Sheet>
            <SheetTrigger asChild >
              <Button variant="ghost" size="icon">
                <Menu className="h-8 w-8 text-[#d4dbff] " />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white">
              <SheetHeader className="text-right mb-4">
                <SheetTitle>
                <SheetTrigger asChild>
                   <Link to="/" className="flex items-center gap-2">
                    <span className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff]  to-[#0147ae] hover:text-[#d4dbff]">Home</span>
                  </Link>
                  </SheetTrigger>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4">
                
                  <div className="grid grid-cols-1 gap-4">
                  {isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    </SheetTrigger>
                    }
                  </div>
                
                  <div className="grid grid-cols-1 gap-4">
                    {!isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]">
                      <Link to="/login">Register</Link>
                    </Button>
                    </SheetTrigger>
                    }
                  </div>
                
                  <div className="grid grid-cols-1 gap-4">
                  {!isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild className="bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#d4dbff] via-[#0147ae] to-[#001a4b] hover:text-[#d4dbff]">
                      <Link to="/login">Login</Link>
                    </Button>
                    </SheetTrigger>
                  }
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {isAuthenticated &&
                  <SheetTrigger asChild>
                    <Button asChild className='bg-clip-text text-transparent text-xl bg-gradient-to-r from-[#001a4b] via-[#d8dce2] to-[#001a4b]'>
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