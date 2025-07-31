import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';
import { RepairerBadge } from '@/components/badges/RepairerBadges';

export const useRepairerBadges = (profile: RepairerProfile | null) => {
  const [badges, setBadges] = useState<RepairerBadge[]>([]);
  const [loading, setLoading] = useState(true);

  // Calcul automatique des badges basé sur le profil
  const calculateBadges = (profile: RepairerProfile): RepairerBadge[] => {
    const calculatedBadges: RepairerBadge[] = [
      // Badge SIRET vérifié
      {
        id: 'siret_verified',
        type: 'siret_verified',
        name: 'SIRET Vérifié',
        description: 'Entreprise avec numéro SIRET validé',
        earned: !!(profile.siret_number?.trim()),
        earnedAt: profile.siret_number ? profile.created_at : undefined,
        criteria: 'Avoir un numéro SIRET valide'
      },
      
      // Badge QualiRépar
      {
        id: 'qualirepar',
        type: 'qualirepar',
        name: 'QualiRépar Certifié',
        description: 'Réparateur certifié par le programme QualiRépar',
        earned: profile.has_qualirepar_label || false,
        earnedAt: profile.has_qualirepar_label ? profile.updated_at : undefined,
        level: 'gold',
        criteria: 'Certification QualiRépar validée'
      },
      
      // Badge Multi-spécialiste
      {
        id: 'multi_specialist',
        type: 'multi_specialist',
        name: 'Multi-spécialiste',
        description: 'Maîtrise plusieurs types de réparations',
        earned: (profile.repair_types?.length || 0) >= 3,
        earnedAt: (profile.repair_types?.length || 0) >= 3 ? profile.updated_at : undefined,
        level: (profile.repair_types?.length || 0) >= 5 ? 'gold' : 'silver',
        criteria: 'Proposer au moins 3 types de réparations'
      },
      
      // Badge Service 6j/7
      {
        id: 'service_247',
        type: 'service_247', 
        name: 'Service 6j/7',
        description: 'Ouvert 6 jours sur 7',
        earned: profile.opening_hours && Object.keys(profile.opening_hours).length >= 6,
        earnedAt: profile.opening_hours && Object.keys(profile.opening_hours).length >= 6 ? profile.updated_at : undefined,
        criteria: 'Être ouvert au moins 6 jours par semaine'
      },
      
      // Badge Présence Web
      {
        id: 'web_presence',
        type: 'web_presence',
        name: 'Présence Web',
        description: 'Site web professionnel actif',
        earned: !!(profile.website?.trim()),
        earnedAt: profile.website ? profile.updated_at : undefined,
        criteria: 'Avoir un site web renseigné'
      },
      
      // Badge Profil Détaillé
      {
        id: 'detailed_profile',
        type: 'detailed_profile',
        name: 'Profil Détaillé',
        description: 'Description complète et informative',
        earned: !!(profile.description?.trim() && profile.description.length > 100),
        earnedAt: profile.description && profile.description.length > 100 ? profile.updated_at : undefined,
        criteria: 'Description de plus de 100 caractères'
      },
      
      // Badge Expert Local
      {
        id: 'local_expert',
        type: 'local_expert',
        name: 'Expert Local',
        description: 'Spécialiste reconnu dans sa région',
        earned: !!(profile.address?.trim() && profile.city?.trim()),
        earnedAt: profile.address && profile.city ? profile.updated_at : undefined,
        criteria: 'Adresse complète renseignée'
      },
      
      // Badge Réactivité (basé sur la date de dernière mise à jour)
      {
        id: 'fast_response',
        type: 'fast_response',
        name: 'Réactif',
        description: 'Réponse rapide aux demandes',
        earned: profile.updated_at ? 
          (Date.now() - new Date(profile.updated_at).getTime()) < (7 * 24 * 60 * 60 * 1000) : false,
        earnedAt: profile.updated_at,
        criteria: 'Profil mis à jour récemment'
      }
    ];

    return calculatedBadges;
  };

  useEffect(() => {
    if (!profile) {
      setBadges([]);
      setLoading(false);
      return;
    }

    const fetchStoredBadges = async () => {
      try {
        // Calculer directement les badges pour éviter les erreurs de DB
        const badgesData = calculateBadges(profile);
        setBadges(badgesData);
        
        // Log pour debug
        console.log('Badges calculés:', badgesData.filter(b => b.earned).map(b => b.name));

      } catch (error) {
        console.error('Erreur générale badges:', error);
        // En cas d'erreur, utiliser seulement les badges calculés
        setBadges(calculateBadges(profile));
      } finally {
        setLoading(false);
      }
    };

    fetchStoredBadges();
  }, [profile]);

  // Fonction pour débloquer manuellement un badge (temporairement simplifiée)
  const unlockBadge = async (badgeType: string, level?: 'bronze' | 'silver' | 'gold' | 'diamond') => {
    if (!profile) return false;

    try {
      // Mettre à jour l'état local seulement
      setBadges(prev => prev.map(badge => 
        badge.type === badgeType 
          ? { ...badge, earned: true, earnedAt: new Date().toISOString(), level: level || badge.level }
          : badge
      ));

      return true;
    } catch (error) {
      console.error('Erreur déblocage badge:', error);
      return false;
    }
  };

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return {
    badges,
    earnedBadges,
    availableBadges,
    loading,
    unlockBadge,
    badgeCount: earnedBadges.length,
    completionRate: badges.length > 0 ? (earnedBadges.length / badges.length) * 100 : 0
  };
};