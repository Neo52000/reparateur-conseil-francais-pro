
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ScrapingInfoPanel = () => {
  return (
    <div className="p-4 bg-orange-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
        Scraping Massif et Éthique
      </h4>
      <ul className="text-sm text-orange-800 space-y-1">
        <li>• <strong>Anti-blocage</strong> : Délais aléatoires 1-3s entre requêtes</li>
        <li>• <strong>User-Agents rotatifs</strong> : Simulation de vrais navigateurs</li>
        <li>• <strong>Classification avancée</strong> : +30 mots-clés de détection</li>
        <li>• <strong>Géolocalisation précise</strong> : 101 départements français</li>
        <li>• <strong>Déduplication intelligente</strong> : Nom + adresse + ville</li>
        <li>• <strong>Objectif</strong> : 20,000+ réparateurs en 2-4 heures</li>
      </ul>
    </div>
  );
};

export default ScrapingInfoPanel;
