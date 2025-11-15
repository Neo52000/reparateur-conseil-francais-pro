import React from 'react';
import { Heart, Search } from 'lucide-react';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { useNavigate } from 'react-router-dom';

export const ClientFavoritesEmpty: React.FC = () => {
  const navigate = useNavigate();

  return (
    <EnhancedEmptyState
      icon={Heart}
      title="Aucun réparateur favori"
      description="Sauvegardez vos réparateurs préférés pour les retrouver facilement"
      primaryAction={{
        label: 'Explorer les réparateurs',
        onClick: () => navigate('/search'),
        icon: Search
      }}
      suggestions={[
        'Cliquez sur le cœur sur la fiche d\'un réparateur pour l\'ajouter',
        'Accédez rapidement à vos favoris depuis votre dashboard',
        'Recevez des notifications de leurs offres spéciales'
      ]}
    />
  );
};
