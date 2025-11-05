import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { getNewsFetch, Article } from "@/services/newsService";
import { Loader2, AlertTriangle, Newspaper, ArrowLeft, Search } from "lucide-react";

// --- TIPOS Y CONSTANTES ---
const NEWS_PER_PAGE = 20; // Datos con los que trabajar en el cliente
const SORT_OPTIONS = {
  PUBLISHED_AT: 'publishedAt',
  RELEVANCY: 'relevancy',
  POPULARITY: 'popularity',
};

// Lista simulada de fuentes populares para el filtro de "Popularidad"
const POPULAR_SOURCES = ['Reuters', 'BBC News', 'Associated Press', 'The New York Times', 'The Guardian', 'Le Monde'];


// --- COMPONENTES AUXILIARES ---

/**
 * Componente para los controles de búsqueda y ordenación.
 */
const SortAndSearchControls: React.FC<{
  sortBy: string;
  searchQuery: string;
  onSortChange: (value: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ sortBy, searchQuery, onSortChange, onSearchChange }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-8">
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-900" />
      <Input
        type="text"
        placeholder="Buscar por palabra clave..."
        value={searchQuery}
        onChange={onSearchChange}
        className="pl-10 w-full text-blue-900"
      />
    </div>
    <div className="flex-shrink-0 w-full sm:w-48">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-[#0147ae]">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-[#0147ae]" value={SORT_OPTIONS.PUBLISHED_AT}>Fecha de publicación</SelectItem>
          <SelectItem className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-[#0147ae]" value={SORT_OPTIONS.RELEVANCY}>Relevancia</SelectItem>
          <SelectItem className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-[#0147ae]" value={SORT_OPTIONS.POPULARITY}>Popularidad de la fuente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

/**
 * Componente para renderizar una columna de noticias.
 */
const NewsColumn: React.FC<{ title: string; articles: Article[] }> = ({ title, articles }) => (
    <aside className="lg:col-span-1 flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-slate-100 pb-2 border-b-2   bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-900">
        {title}
      </h2>
      {articles.length > 0 ? (
        articles.map((article, index) => (
          <Card key={`${article.url}-${index}`} className="bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold leading-tight text-slate-800 dark:text-slate-100">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                  {article.title}
                </a>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                {article.source?.name} - {new Date(article.publishedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))
      ) : (
        <p className="text-slate-500 dark:text-slate-400">No hay noticias en esta sección.</p>
      )}
    </aside>
  );

// --- COMPONENTE PRINCIPAL ---

const Noticias: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  
  // Nuevos estados para búsqueda y ordenación
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.PUBLISHED_AT);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = useCallback(async (page: number, append = false) => {
    if (append) setIsLoadingMore(true); else setIsLoading(true);
    setError(null);

    try {
      const newArticles = await getNewsFetch(page, NEWS_PER_PAGE);
      
      if (newArticles.length === 0 || newArticles.length < NEWS_PER_PAGE) {
        setHasMoreNews(false);
      }
      
      setArticles(prev => append ? [...prev, ...newArticles] : newArticles);

    } catch (err) {
      const errorMessage = (err as Error).message || "Error desconocido al cargar noticias.";
      setError(errorMessage);
      toast.error(`Error al cargar noticias: ${errorMessage}`);
    } finally {
      if (append) setIsLoadingMore(false); else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const routeState = location.state as { connectionSuccess?: boolean; errorMessage?: string } | undefined;
    if (routeState?.connectionSuccess === false && routeState.errorMessage) {
      toast.error(routeState.errorMessage);
    }
    fetchNews(1, false);
  }, [fetchNews, location.state]);

  // Lógica de filtrado y ordenación en el cliente
  const processedArticles = useMemo(() => {
    // 1. Filtrar por palabra clave
    const filtered = searchQuery
      ? articles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (article.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : articles;

    // 2. Ordenar según el criterio seleccionado
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.RELEVANCY:
          const aTitleMatch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
          const bTitleMatch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
          if (aTitleMatch && !bTitleMatch) return -1; // 'a' es más relevante
          if (!aTitleMatch && bTitleMatch) return 1;  // 'b' es más relevante
          return 0; // Misma relevancia, mantiene orden

        case SORT_OPTIONS.POPULARITY:
          const aIsPopular = POPULAR_SOURCES.includes(a.source?.name || '');
          const bIsPopular = POPULAR_SOURCES.includes(b.source?.name || '');
          if (aIsPopular && !bIsPopular) return -1; // 'a' es más popular
          if (!aIsPopular && bIsPopular) return 1;  // 'b' es más popular
          return 0; // Misma popularidad, mantiene orden

        case SORT_OPTIONS.PUBLISHED_AT:
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

    return sorted;
  }, [articles, sortBy, searchQuery]);


  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreNews) {
      const nextPage = currentPage + 1;
      fetchNews(nextPage, true);
      setCurrentPage(nextPage);
    }
  };

  const mainNews = processedArticles.slice(0, 4);
  const leftSidebarNews = processedArticles.slice(4, 12);
  const rightSidebarNews = processedArticles.slice(12, 20);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900 to-gray-900 text-white overflow-x-hidden p-4">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-screen-2xl overflow-y-auto max-h-[calc(100vh-theme(spacing.12))] custom-scrollbar-transparent">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <Newspaper className="h-10 w-10 text-blue-300 mr-3" />
            <h1 className="text-3xl font-bold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-900">
              Noticias del Día
            </h1>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="ghost" className="w-full sm:w-auto bg-gradient-to-r from-blue-300 to-blue-900 hover:cursor-pointer hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Button>
        </header>

        <SortAndSearchControls
            sortBy={sortBy}
            searchQuery={searchQuery}
            onSortChange={setSortBy}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
        />

        {isLoading && articles.length === 0 && (
          <div className="flex flex-col justify-center items-center h-64 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-xl">Cargando noticias...</p>
          </div>
        )}

        {error && articles.length === 0 && (
          <Alert variant="destructive" className='bg-transparent'>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Fallo al Cargar las Noticias revise su conexion</AlertTitle>
          </Alert>
        )}

        {processedArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <NewsColumn title="Noticias" articles={leftSidebarNews} />

            <main className="lg:col-span-2 flex flex-col gap-6">
              <h2 className="text-2xl font-bold  pb-2 border-b-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-900">
                Noticias Destacadas
              </h2>
              {mainNews.map((article) => (
                <Card key={article.url} className="flex flex-col bg-white dark:bg-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg">
                    {article.urlToImage && (
                      <img src={article.urlToImage} alt={article.title} className="w-full h-56 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible'; }}/>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                      </CardTitle>
                      <CardDescription className="text-sm pt-1">
                        Fuente: {article.source?.name} - {new Date(article.publishedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p>{article.description || 'No hay descripción disponible.'}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="link" className="p-0 h-auto text-blue-900 dark:text-blue-400 font-semibold">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">Leer más &rarr;</a>
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </main>

            <NewsColumn title="Más para leer" articles={rightSidebarNews} />
          </div>
        ) : !isLoading && (
            <div className="text-center col-span-1 lg:col-span-4 py-10 bg-transparent rounded-lg">
                <p className="text-xl text-slate-600 dark:text-slate-300">No se encontraron noticias que coincidan con tu búsqueda.</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Intenta con otra palabra clave o ajusta los filtros.</p>
            </div>
        )}
        
        {hasMoreNews && (
          <div className="text-center mt-12">
            <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="ghost" size="lg" className="bg-gradient-to-r from-blue-300 to-blue-900 hover:cursor-pointer hover:text-white">
              {isLoadingMore ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando...</> : 'Cargar más noticias'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Noticias;