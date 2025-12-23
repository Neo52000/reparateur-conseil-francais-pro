import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, MapPin, MessageSquare } from 'lucide-react';
import { usePlatformStats, formatStatForDisplay } from '@/hooks/usePlatformStats';

const SocialProofSection: React.FC = () => {
  const { data: stats, isLoading: loading } = usePlatformStats();

  const displayStats = [
    { 
      number: stats ? formatStatForDisplay(stats.totalRepairers) : '...', 
      label: "Réparateurs partenaires",
      icon: Users 
    },
    { 
      number: stats ? formatStatForDisplay(stats.citiesCovered) : '...', 
      label: "Villes couvertes",
      icon: MapPin 
    },
    { 
      number: stats ? formatStatForDisplay(stats.totalReviews) : '...', 
      label: "Avis clients",
      icon: MessageSquare 
    },
    { 
      number: stats ? `${stats.averageRating}/5` : '...', 
      label: "Note moyenne",
      icon: Star 
    }
  ];

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Statistiques en temps réel */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Rejoignez une communauté qui grandit
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Des réparateurs développent leur activité avec nous chaque jour
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {loading ? '...' : stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Labels de confiance */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Badge variant="outline" className="px-4 py-2">
              🏆 Certifié Qualité
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🔒 Données sécurisées
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              📊 Conforme RGPD
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              ⚡ Support réactif
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofSection;
