const API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Asegúrate de tener esta variable en tu .env
const BASE_URL = 'https://newsapi.org/v2/top-headlines'; // API de ejemplo, puedes cambiarla

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
  message?: string; // Para errores de la API
  code?: string; // Para errores de la API
}

export const getNewsFetch = async (page = 1, pageSize = 10): Promise<Article[]> => {
  if (!API_KEY) {
    console.error("VITE_NEWS_API_KEY no está configurada en el archivo .env.");
    throw new Error("La clave API para el servicio de noticias no está configurada.");
  }

  const params = new URLSearchParams({
    country: 'us', // Puedes cambiar el país o hacerlo configurable
    apiKey: API_KEY,
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;
    try {
      const errorData: NewsApiResponse = await response.json();
      if (errorData.message) {
        errorMessage = `Error de API: ${errorData.message} (código: ${errorData.code || 'N/A'})`;
      }
    } catch (e) {
      // No se pudo parsear el cuerpo del error JSON
    }
    console.error('Error al obtener noticias:', errorMessage);
    throw new Error(errorMessage);
  }

  const data: NewsApiResponse = await response.json();

  if (data.status === 'ok') {
    return data.articles;
  } else {
    const apiErrorMessage = data.message || 'Error desconocido de la API al obtener noticias.';
    console.error('La API devolvió un estado de error:', apiErrorMessage);
    throw new Error(apiErrorMessage);
  }
};

export const checkNewsApiConnectionFetch = async (): Promise<boolean> => {
  try {
    await getNewsFetch(1, 1); // Intenta obtener un artículo para verificar la conexión
    return true;
  } catch (error) {
    // El error ya se loguea en getNewsFetch
    return false;
  }
};