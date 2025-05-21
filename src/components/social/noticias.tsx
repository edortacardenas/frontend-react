import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Ajusta la ruta si es necesario
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Ajusta la ruta
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Ajusta la ruta
import { toast } from "react-hot-toast";
import { getNewsFetch, Article } from "@/services/newsService"; // Ajusta la ruta
import { Loader2, AlertTriangle, Newspaper, ArrowLeft } from "lucide-react";

const NEWS_PER_PAGE = 10;

const Noticias: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Inicia cargando
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);

  const fetchNews = useCallback(async (page: number, append = false) => {
    if (append) setIsLoadingMore(true); else setIsLoading(true);
    setError(null);

    try {
      const newArticles = await getNewsFetch(page, NEWS_PER_PAGE);
      if (newArticles.length === 0 || newArticles.length < NEWS_PER_PAGE) {
        setHasMoreNews(false);
      }
      setArticles(prevArticles => append ? [...prevArticles, ...newArticles] : newArticles);
    } catch (err) {
      const errorMessage = (err as Error).message || "Error desconocido al cargar noticias.";
      setError(errorMessage);
      // El toast de error de conexión inicial se maneja abajo.
      // Este toast es para errores subsiguientes (ej. "Más noticias").
      if (append || page > 1) {
        toast.error(`Error al cargar más noticias: ${errorMessage}`);
      }
    } finally {
      if (append) setIsLoadingMore(false); else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const routeState = location.state as { connectionSuccess?: boolean; errorMessage?: string } | undefined;

    if (routeState?.connectionSuccess === false && routeState.errorMessage) {
      toast.error(routeState.errorMessage); // Muestra el toast "Conexion fallida ocurrio un error"
      // Aunque la conexión inicial falló, intentamos cargar noticias.
      // Si la API está completamente caída, fetchNews manejará el error y lo mostrará en la UI.
    }
    
    // Cargar las primeras 10 noticias
    fetchNews(1, false);

  }, [fetchNews, location.state]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreNews) {
      const nextPage = currentPage + 1;
      fetchNews(nextPage, true);
      setCurrentPage(nextPage);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Asumiendo que el dashboard está en la ruta raíz
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[url('/textura1.jpg')] md:bg-[url('/noticias-home.jpg')] md:bg-contain md:bg-no-repeat md:bg-center">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50/90 dark:bg-slate-800/90 rounded-lg shadow-xl w-full max-w-7xl overflow-y-auto max-h-[calc(100vh-theme(spacing.24))]">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <Newspaper className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100">
              Noticias Recientes
            </h1>
          </div>
          <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar y Volver
          </Button>
        </header>

        {isLoading && articles.length === 0 && (
          <div className="flex flex-col justify-center items-center h-64 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-xl">Cargando noticias...</p>
          </div>
        )}

        {error && articles.length === 0 && !isLoading && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-300" />
            <AlertTitle className="font-semibold">Fallo al Cargar Noticias</AlertTitle>
            <AlertDescription>{error} Por favor, verifica tu conexión o inténtalo de nuevo más tarde.</AlertDescription>
          </Alert>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article, index) => (
              <Card key={article.url + index} className="flex flex-col bg-white dark:bg-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible'; }} // Placeholder
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    Imagen no disponible
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                  </CardTitle>
                  {article.source?.name && (
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                      Fuente: {article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow text-sm text-slate-600 dark:text-slate-300">
                  <p>{article.description || 'No hay descripción disponible para esta noticia.'}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">Leer más &rarr;</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {articles.length > 0 && hasMoreNews && (
          <div className="text-center mt-10">
            <Button onClick={handleLoadMore} disabled={isLoadingMore} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
              {isLoadingMore ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando más...</> : 'Mas noticias'}
            </Button>
          </div>
        )}
        {!hasMoreNews && articles.length > 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 mt-10 py-4 bg-slate-100 dark:bg-slate-700/50 rounded-md">No hay más noticias para mostrar.</p>
        )}
        </div>
    </div>
  );
};

export default Noticias;