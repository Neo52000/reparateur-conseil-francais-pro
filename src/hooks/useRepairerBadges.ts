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
        // Récupérer les badges stockés en base de données
        const { data: storedBadges, error } = await supabase
          .from('repairer_badges')
          .select('*')
          .eq('repairer_id', profile.id);

        if (error) {
          console.error('Erreur lors de la récupération des badges:', error);
        }

        // Calculer les badges automatiques
        const calculatedBadges = calculateBadges(profile);
        
        // Fusionner avec les badges stockés
        const allBadges = calculatedBadges.map(calculated => {
          const stored = storedBadges?.find(stored => stored.badge_type === calculated.type);
          if (stored) {
            return {
              ...calculated,
              id: stored.id,
              earned: stored.earned,
              earnedAt: stored.earned_at,
              level: stored.level || calculated.level
            };
          }
          return calculated;
        });

        setBadges(allBadges);
        
        // Sauvegarder les nouveaux badges automatiques
        const newlyEarnedBadges = calculatedBadges.filter(badge => 
          badge.earned && !storedBadges?.find(stored => 
            stored.badge_type === badge.type && stored.earned
          )
        );

        if (newlyEarnedBadges.length > 0) {
          const badgesToInsert = newlyEarnedBadges.map(badge => ({
            repairer_id: profile.id,
            badge_type: badge.type,
            badge_name: badge.name,
            earned: true,
            earned_at: new Date().toISOString(),
            level: badge.level,
            criteria: badge.criteria
          }));

          const { error: insertError } = await supabase
            .from('repairer_badges')
            .upsert(badgesToInsert, { 
              onConflict: 'repairer_id,badge_type',
              ignoreDuplicates: false 
            });

          if (insertError) {
            console.error('Erreur lors de l\'insertion des badges:', insertError);
          }
        }

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

  // Fonction pour débloquer manuellement un badge
  const unlockBadge = async (badgeType: string, level?: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('repairer_badges')
        .upsert({
          repairer_id: profile.id,
          badge_type: badgeType,
          earned: true,
          earned_at: new Date().toISOString(),
          level: level
        }, { onConflict: 'repairer_id,badge_type' });

      if (error) {
        console.error('Erreur lors du déblocage du badge:', error);
        return false;
      }

      // Mettre à jour l'état local
      setBadges(prev => prev.map(badge => 
        badge.type === badgeType 
          ? { ...badge, earned: true, earnedAt: new Date().toISOString(), level: level || badge.level }
          : badge
      ));

      return true;
    } catch (error) {
      console.error('Erreur générale déblocage badge:', error);
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