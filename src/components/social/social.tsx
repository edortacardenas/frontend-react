
import { Link } from "react-router-dom";
import { SiGithub, SiGoogle } from "react-icons/si"; // Importar iconos
import { Button } from "@/components/ui/button"

const Social = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" className="w-full" asChild>
            <Link to={`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`} className="flex items-center justify-center gap-2">
              <SiGoogle className="h-5 w-5" /> Google
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link to={`${import.meta.env.VITE_BACKEND_URL}/api/auth/github`} className="flex items-center justify-center gap-2">
              <SiGithub className="h-5 w-5" /> GitHub
            </Link>
          </Button>
        </div>
  );
}

export default Social;
