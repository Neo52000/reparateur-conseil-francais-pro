import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const WeatherPage: React.FC = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: location.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données météo');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('sun') || iconCode.includes('clear')) {
      return <Sun className="w-12 h-12 text-yellow-500" />;
    }
    if (iconCode.includes('rain')) {
      return <CloudRain className="w-12 h-12 text-blue-500" />;
    }
    return <Cloud className="w-12 h-12 text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Météo</h1>
        <p className="text-muted-foreground">
          Consultez les conditions météorologiques actuelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche météo</CardTitle>
          <CardDescription>
            Entrez le nom d'une ville pour obtenir les informations météo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nom de la ville..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <Button onClick={fetchWeather} disabled={loading || !location.trim()}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {weather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon(weather.icon)}
              {weather.location}
            </CardTitle>
            <CardDescription>{weather.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span className="font-medium">Température:</span>
                <span>{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Humidité:</span>
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Vent:</span>
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherPage;