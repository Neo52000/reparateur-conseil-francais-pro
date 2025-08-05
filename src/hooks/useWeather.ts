import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { APP_CONFIG } from '@/config';

interface WeatherForecast {
  datetime: string;
  tmin: number;
  tmax: number;
  weather: number;
  wind10m: number;
  gust10m: number;
  dirwind10m: number;
  rr10: number;
  rr1: number;
  probarain: number;
  probafrost: number;
  probafog: number;
  probawind70: number;
  probawind100: number;
  gustx: number;
}

interface WeatherCity {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  country: string;
  city: string;
}

interface WeatherData {
  city: WeatherCity;
  update: string;
  forecast: WeatherForecast[][];
}

interface WeatherResponse {
  success: boolean;
  data: WeatherData;
  station_id: string;
  location: string;
  error?: string;
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si le module est désactivé, retourner des valeurs par défaut
  if (!APP_CONFIG.features.enableWeatherModule) {
    return {
      weatherData: null,
      loading: false,
      error: "Module météo désactivé",
      refetch: () => Promise.resolve()
    };
  }

  const fetchWeatherData = async (endpoint: 'current' | 'forecast' | 'hourly' | 'weekly' | 'alerts' = 'forecast') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('weather-api', {
        body: { endpoint }
      });

      if (error) throw error;

      const response = data as WeatherResponse;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch weather data');
      }

      setWeatherData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return {
    weatherData,
    loading,
    error,
    refetch: fetchWeatherData
  };
};

// Weather condition codes to descriptions
export const getWeatherDescription = (code: number): string => {
  const descriptions: { [key: number]: string } = {
    0: 'Soleil',
    1: 'Peu nuageux',
    2: 'Ciel voilé',
    3: 'Nuageux',
    4: 'Très nuageux',
    5: 'Couvert',
    6: 'Brouillard',
    7: 'Brouillard givrant',
    10: 'Pluie faible',
    11: 'Pluie modérée',
    12: 'Pluie forte',
    13: 'Pluie faible verglaçante',
    14: 'Pluie modérée verglaçante',
    15: 'Pluie forte verglaçante',
    16: 'Bruine',
    20: 'Neige faible',
    21: 'Neige modérée',
    22: 'Neige forte',
    30: 'Pluie et neige mêlées faibles',
    31: 'Pluie et neige mêlées modérées',
    32: 'Pluie et neige mêlées fortes',
    40: 'Averses de pluie faibles',
    41: 'Averses de pluie modérées',
    42: 'Averses de pluie fortes',
    43: 'Averses de pluie faibles et fréquentes',
    44: 'Averses de pluie modérées et fréquentes',
    45: 'Averses de pluie fortes et fréquentes',
    60: 'Averses de neige faibles',
    61: 'Averses de neige modérées',
    62: 'Averses de neige fortes',
    70: 'Averses de pluie et neige mêlées faibles',
    71: 'Averses de pluie et neige mêlées modérées',
    72: 'Averses de pluie et neige mêlées fortes',
    100: 'Orages faibles et locaux',
    101: 'Orages modérés et locaux',
    102: 'Orages forts et locaux',
    103: 'Orages faibles et étendus',
    104: 'Orages modérés et étendus',
    105: 'Orages forts et étendus',
    106: 'Orages faibles avec grêle',
    107: 'Orages modérés avec grêle',
    108: 'Orages forts avec grêle'
  };
  
  return descriptions[code] || 'Conditions inconnues';
};

export const getWeatherIcon = (code: number): string => {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 2) return '🌤️';
  if (code >= 3 && code <= 5) return '☁️';
  if (code >= 6 && code <= 7) return '🌫️';
  if (code >= 10 && code <= 16) return '🌧️';
  if (code >= 20 && code <= 22) return '❄️';
  if (code >= 30 && code <= 32) return '🌨️';
  if (code >= 40 && code <= 45) return '🌦️';
  if (code >= 60 && code <= 62) return '🌨️';
  if (code >= 70 && code <= 72) return '🌨️';
  if (code >= 100 && code <= 108) return '⛈️';
  
  return '🌤️';
};