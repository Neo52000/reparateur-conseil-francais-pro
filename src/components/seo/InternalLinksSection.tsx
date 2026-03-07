import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Tablet, Laptop, Gamepad2, MapPin, BookOpen } from 'lucide-react';

/**
 * Section de maillage interne SEO
 * Suit les guidelines SEO Machine : 
 * - Ancres descriptives et keyword-rich
 * - Liens vers pillar content + pages de service
 * - Distribution naturelle, pas de "cliquez ici"
 */

const serviceLinks = [
  { 
    icon: Smartphone, 
    label: 'Réparation smartphone', 
    href: '/reparation-smartphone',
    description: 'iPhone, Samsung, Huawei, Xiaomi'
  },
  { 
    icon: Tablet, 
    label: 'Réparation tablette', 
    href: '/reparation-tablette',
    description: 'iPad, Galaxy Tab, Surface'
  },
  { 
    icon: Laptop, 
    label: 'Réparation ordinateur', 
    href: '/reparation-ordinateur',
    description: 'MacBook, PC portable, desktop'
  },
  { 
    icon: Gamepad2, 
    label: 'Réparation console', 
    href: '/reparation-console',
    description: 'PS5, Xbox, Nintendo Switch'
  },
];

const topCities = [
  { label: 'Paris', href: '/reparateur-smartphone-paris' },
  { label: 'Lyon', href: '/reparateur-smartphone-lyon' },
  { label: 'Marseille', href: '/reparateur-smartphone-marseille' },
  { label: 'Toulouse', href: '/reparateur-smartphone-toulouse' },
  { label: 'Bordeaux', href: '/reparateur-smartphone-bordeaux' },
  { label: 'Lille', href: '/reparateur-smartphone-lille' },
  { label: 'Nantes', href: '/reparateur-smartphone-nantes' },
  { label: 'Nice', href: '/reparateur-smartphone-nice' },
];

const InternalLinksSection: React.FC = () => {
  return (
    <section className="py-16 bg-card" aria-label="Nos services de réparation">
      <div className="container mx-auto px-6 lg:px-10">
        {/* Services */}
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Services de réparation disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {serviceLinks.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.href}
                to={service.href}
                className="flex flex-col items-center p-6 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="font-semibold text-foreground text-sm">{service.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{service.description}</span>
              </Link>
            );
          })}
        </div>

        {/* Villes populaires */}
        <h2 className="text-2xl font-bold text-foreground text-center mb-6">
          <MapPin className="inline w-5 h-5 mr-2 text-primary" aria-hidden="true" />
          Réparateurs par ville
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {topCities.map((city) => (
            <Link
              key={city.href}
              to={city.href}
              className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 text-sm font-medium text-foreground transition-colors"
            >
              Réparateur {city.label}
            </Link>
          ))}
        </div>

        {/* Ressources */}
        <div className="text-center mt-8 space-x-6">
          <Link to="/guide-choisir-reparateur" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Guide : choisir un réparateur
          </Link>
          <Link to="/garantie" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            Notre garantie réparation
          </Link>
          <Link to="/a-propos" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            À propos de TopRéparateurs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InternalLinksSection;
