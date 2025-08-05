import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeather, getWeatherDescription, getWeatherIcon } from '@/hooks/useWeather';
import { RefreshCw, MapPin, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const WeatherDashboard: React.FC = () => {
  const { weatherData, loading, error, refetch } = useWeather();

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Météo Chaumont</h1>
            <p className="text-muted-foreground">Données météorologiques en temps réel</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Chargement...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Météo Chaumont</h1>
            <p className="text-muted-foreground">Données météorologiques en temps réel</p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erreur lors du chargement des données météo</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData || !weatherData.forecast || weatherData.forecast.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Météo Chaumont</h1>
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
    );
  }

  const currentForecast = weatherData.forecast[0][0];
  const weekForecast = weatherData.forecast.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Météo Chaumont
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour: {format(new Date(weatherData.update), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getWeatherIcon(currentForecast.weather)}
            Conditions actuelles
          </CardTitle>
          <CardDescription>
            {getWeatherDescription(currentForecast.weather)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{currentForecast.tmax}°C</p>
                <p className="text-sm text-muted-foreground">Max</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{currentForecast.tmin}°C</p>
                <p className="text-sm text-muted-foreground">Min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-lg font-semibold">{currentForecast.wind10m} km/h</p>
                <p className="text-sm text-muted-foreground">Vent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-semibold">{currentForecast.probarain}%</p>
                <p className="text-sm text-muted-foreground">Pluie</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Prévisions 7 jours</CardTitle>
          <CardDescription>Prévisions météorologiques détaillées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekForecast.map((dayForecast, index) => {
              const forecast = dayForecast[0];
              const date = new Date(forecast.datetime);
              const isToday = index === 0;
              
              return (
                <Card key={index} className={isToday ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {isToday ? 'Aujourd\'hui' : format(date, 'EEE', { locale: fr })}
                        </p>
                        {isToday && <Badge variant="default">Actuel</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(date, 'dd/MM', { locale: fr })}
                      </p>
                      <div className="text-3xl">
                        {getWeatherIcon(forecast.weather)}
                      </div>
                      <p className="text-sm">{getWeatherDescription(forecast.weather)}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600 font-semibold">{forecast.tmax}°</span>
                        <span className="text-blue-600">{forecast.tmin}°</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Wind className="h-3 w-3" />
                        {forecast.wind10m} km/h
                      </div>
                      {forecast.probarain > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                          <Droplets className="h-3 w-3" />
                          {forecast.probarain}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rafales</p>
                <p className="text-lg font-semibold">{currentForecast.gust10m} km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Prob. brouillard</p>
                <p className="text-lg font-semibold">{currentForecast.probafog}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-sm text-muted-foreground">Prob. gel</p>
                <p className="text-lg font-semibold">{currentForecast.probafrost}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vent fort</p>
                <p className="text-lg font-semibold">{currentForecast.probawind70}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherDashboard;