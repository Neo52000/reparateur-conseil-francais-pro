
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile } from '@/types/repairerProfile';
import { getMockProfile } from '@/services/mockRepairerProfiles';

interface UseProfileDataResult {
  profile: RepairerProfile | null;
  loading: boolean;
  fetchProfile: (targetId?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfileData = (repairerId: string, isOpen: boolean): UseProfileDataResult => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapDatabaseProfileToInterface = (data: any): RepairerProfile => ({
    id: data.id,
    repairer_id: data.user_id,
    business_name: data.business_name,
    siret_number: data.siret_number,
    description: data.description,
    address: data.address,
    city: data.city,
    postal_code: data.postal_code,
    phone: data.phone,
    email: data.email,
    website: data.website,
    facebook_url: data.facebook_url,
    instagram_url: data.instagram_url,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    has_qualirepar_label: data.has_qualirepar_label,
    repair_types: data.repair_types,
    profile_image_url: data.profile_image_url,
    created_at: data.created_at,
    updated_at: data.updated_at
  });

  const createMockProfileFromRepairer = async (repairerId: string): Promise<RepairerProfile | null> => {
    try {
      const { data: repairer, error } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching repairer from database:', error);
        return null;
      }

      if (!repairer) {
        console.log('Repairer not found in database:', repairerId);
        return null;
      }

      return {
        id: repairerId,
        repairer_id: repairerId,
        business_name: repairer.name,
        description: `${repairer.name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques. Avec une expertise reconnue et des années d'expérience, nous offrons des services de qualité pour tous vos besoins de réparation.`,
        address: repairer.address,
        city: repairer.city,
        postal_code: repairer.postal_code,
        phone: repairer.phone || '+33 1 23 45 67 89',
        email: repairer.email || `contact@${repairer.name.toLowerCase().replace(/\s+/g, '')}.fr`,
        website: repairer.website || `https://www.${repairer.name.toLowerCase().replace(/\s+/g, '')}.fr`,
        siret_number: '12345678901234',
        repair_types: repairer.services || [],
        profile_image_url: null,
        facebook_url: `https://facebook.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        twitter_url: `https://twitter.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        instagram_url: `https://instagram.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        linkedin_url: `https://linkedin.com/company/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        has_qualirepar_label: Math.random() > 0.5,
        created_at: repairer.created_at,
        updated_at: repairer.updated_at
      };
    } catch (error) {
      console.error('Error creating profile from repairer data:', error);
      return null;
    }
  };

  const fetchProfile = async (targetId?: string) => {
    setLoading(true);
    try {
      const queryId = targetId || repairerId;
      console.log('Fetching profile for repairer ID:', queryId);
      
      // Essayer d'abord de chercher par user_id
      let { data, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('user_id', queryId)
        .maybeSingle();

      // Si pas trouvé par user_id, essayer par email ou autre critère
      if (!data && !error) {
        // Chercher dans la table repairers pour obtenir l'email
        const { data: repairerData } = await supabase
          .from('repairers')
          .select('email')
          .eq('id', queryId)
          .maybeSingle();

        if (repairerData?.email) {
          const result = await supabase
            .from('repairer_profiles')
            .select('*')
            .eq('email', repairerData.email)
            .maybeSingle();
          
          data = result.data;
          error = result.error;
        }
      }

      if (error && !error.message.includes('invalid input syntax for type uuid')) {
        throw error;
      }

      if (data) {
        console.log('Found profile in database:', data);
        const mappedProfile = mapDatabaseProfileToInterface(data);
        setProfile(mappedProfile);
      } else {
        console.log('No profile found in database, creating mock profile');
        const profileFromRepairer = await createMockProfileFromRepairer(queryId);
        if (profileFromRepairer) {
          setProfile(profileFromRepairer);
        } else {
          const mockProfile = getMockProfile(queryId);
          if (mockProfile) {
            setProfile(mockProfile);
          } else {
            setProfile(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const fallbackProfile = await createMockProfileFromRepairer(targetId || repairerId);
      if (fallbackProfile) {
        setProfile(fallbackProfile);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil du réparateur",
          variant: "destructive"
        });
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    if (isOpen && repairerId) {
      fetchProfile();
    }
  }, [isOpen, repairerId]);

  return { profile, loading, fetchProfile, refreshProfile };
};
