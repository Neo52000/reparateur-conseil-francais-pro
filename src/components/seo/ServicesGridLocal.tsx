import React from 'react';
import { Card } from '@/components/ui/card';
import { Smartphone, Battery, Plug, Speaker, Camera, Droplet } from 'lucide-react';

interface Service {
  name: string;
  price: string;
  duration: string;
}

interface ServicesGridLocalProps {
  services: Service[];
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('écran') || name.includes('vitre')) return Smartphone;
  if (name.includes('batterie')) return Battery;
  if (name.includes('connecteur') || name.includes('charge')) return Plug;
  if (name.includes('haut-parleur') || name.includes('micro')) return Speaker;
  if (name.includes('caméra') || name.includes('appareil')) return Camera;
  if (name.includes('eau') || name.includes('liquide')) return Droplet;
  return Smartphone;
};

export default function ServicesGridLocal({ services }: ServicesGridLocalProps) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Nos services de réparation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Des réparations professionnelles avec des pièces de qualité et une garantie de 6 mois
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const IconComponent = getServiceIcon(service.name);
          
          return (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-gray-100 bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{service.price}</div>
                      <div className="text-sm text-muted-foreground">Délai : {service.duration}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Prix indicatifs • Devis personnalisé gratuit • Toutes réparations garanties 6 mois
        </p>
      </div>
    </section>
  );
}
