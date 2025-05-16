

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "../../ui/spinner"; // Assuming Spinner component path
import { CheckCircle, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado en la URL. Por favor, asegúrate de usar el enlace correcto.");
      return;
    }

    const verifyToken = async () => {
      setStatus("loading");
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/complete-email-verification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // For Scenario 2 (initial verification), this endpoint on the backend
          // does not use authValid, so credentials: "include" is not strictly
          // necessary for *this specific call*. User is identified by token.
          credentials: "include", 
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.msg || "¡Correo electrónico verificado exitosamente! Ahora puedes iniciar sesión.");
          setTimeout(() => {
            // For Scenario 2, user is not logged in yet. Navigate to login.
            navigate("/login"); 
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.msg || "Error al verificar el correo electrónico. El token podría ser inválido o haber expirado.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Ocurrió un error de red. Por favor, intenta de nuevo.");
        console.error("Error verifying email token:", error);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  const renderStatus = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-2">
            <Spinner /> {/* Optionally specify size if your Spinner supports it */}
            <p className="text-muted-foreground">Verificando tu correo electrónico...</p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center space-y-2 text-green-600">
            <CheckCircle className="h-12 w-12" />
            <p>{message}</p>
            <Button onClick={() => navigate("/login")} variant="default" className="mt-4">
              Ir a Iniciar Sesión
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center space-y-2 text-red-600">
            <XCircle className="h-12 w-12" />
            <p>{message}</p>
            <Button onClick={() => navigate("/login")} variant="outline" className="mt-4">
              Volver al Inicio de Sesión
            </Button>
          </div>
        );
      default: // idle
        return <p className="text-muted-foreground">Esperando token de verificación...</p>;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Verificación de Correo Electrónico</CardTitle>
          <CardDescription className="text-center">
            {status !== 'loading' && status !== 'success' && "Procesando tu solicitud de verificación."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {renderStatus()}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;