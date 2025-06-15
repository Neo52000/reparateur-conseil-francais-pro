
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Globe, Facebook, Instagram, Linkedin, Twitter, Phone, Mail, MapPin, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RepairerProfileForm from './RepairerProfileForm';

interface RepairerProfile {
  id: string;
  user_id: string;
  business_name: string;
  siret_number: string | null;
  description: string | null;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  has_qualirepar_label: boolean;
  repair_types: string[];
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface RepairerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
  isAdmin?: boolean;
}

// Profils mockés pour les réparateurs de test
const getMockProfile = (repairerId: string): RepairerProfile | null => {
  const mockProfiles: Record<string, RepairerProfile> = {
    'test-repairer-001': {
      id: 'mock-profile-001',
      user_id: 'test-repairer-001',
      business_name: 'TechRepair Pro',
      siret_number: '12345678901234',
      description: 'Spécialiste en réparation de smartphones et tablettes avec plus de 10 ans d\'expérience. Nous utilisons uniquement des pièces de qualité et offrons une garantie de 6 mois sur toutes nos réparations.',
      address: '123 Rue de la République',
      city: 'Paris',
      postal_code: '75001',
      phone: '+33 1 23 45 67 89',
      email: 'tech@repair.fr',
      website: 'https://techrepair-pro.fr',
      facebook_url: 'https://facebook.com/techrepairpro',
      instagram_url: 'https://instagram.com/techrepairpro',
      linkedin_url: null,
      twitter_url: null,
      has_qualirepar_label: true,
      repair_types: ['telephone', 'ordinateur'],
      profile_image_url: null,
      created_at: '2023-01-15T10:00:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    },
    'test-repairer-002': {
      id: 'mock-profile-002',
      user_id: 'test-repairer-002',
      business_name: 'Mobile Fix Express',
      siret_number: '98765432109876',
      description: 'Réparation rapide de mobiles et accessoires. Service express en moins de 2h pour la plupart des pannes courantes.',
      address: '456 Avenue des Lumières',
      city: 'Lyon',
      postal_code: '69001',
      phone: '+33 1 98 76 54 32',
      email: 'contact@mobilefix.fr',
      website: 'https://mobilefix-express.fr',
      facebook_url: null,
      instagram_url: 'https://instagram.com/mobilefixexpress',
      linkedin_url: 'https://linkedin.com/company/mobilefixexpress',
      twitter_url: null,
      has_qualirepar_label: false,
      repair_types: ['telephone', 'montre'],
      profile_image_url: null,
      created_at: '2023-02-20T14:30:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    },
    'test-repairer-003': {
      id: 'mock-profile-003',
      user_id: 'test-repairer-003',
      business_name: 'Smartphone Clinic',
      siret_number: null,
      description: 'Clinique spécialisée dans le diagnostic et la réparation de smartphones. Devis gratuit et transparent.',
      address: '789 Boulevard du Port',
      city: 'Marseille',
      postal_code: '13001',
      phone: '+33 1 11 22 33 44',
      email: 'info@smartphoneclinic.fr',
      website: null,
      facebook_url: 'https://facebook.com/smartphoneclinic',
      instagram_url: null,
      linkedin_url: null,
      twitter_url: null,
      has_qualirepar_label: false,
      repair_types: ['telephone', 'autres'],
      profile_image_url: null,
      created_at: '2023-03-10T09:15:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    }
  };

  return mockProfiles[repairerId] || null;
};

const RepairerProfileModal: React.FC<RepairerProfileModalProps> = ({
  isOpen,
  onClose,
  repairerId,
  isAdmin = false
}) => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && repairerId) {
      fetchProfile();
    }
  }, [isOpen, repairerId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // D'abord essayer de récupérer le profil depuis Supabase
      const { data, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('user_id', repairerId)
        .maybeSingle();

      if (error && !error.message.includes('invalid input syntax for type uuid')) {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Si pas de profil trouvé ou erreur UUID, utiliser les données mockées
        const mockProfile = getMockProfile(repairerId);
        setProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // En cas d'erreur, essayer les données mockées
      const mockProfile = getMockProfile(repairerId);
      if (mockProfile) {
        setProfile(mockProfile);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil du réparateur",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: RepairerProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    toast({
      title: "Succès",
      description: "Profil mis à jour avec succès"
    });
  };

  const getRepairTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      telephone: 'Téléphone',
      montre: 'Montre',
      console: 'Console',
      ordinateur: 'Ordinateur',
      autres: 'Autres'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Profil non trouvé</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun profil trouvé pour ce réparateur.</p>
            <Button onClick={onClose} className="mt-4">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <RepairerProfileForm
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{profile.business_name}</DialogTitle>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="contact">Contact & Réseaux</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Identité</h3>
                <div className="space-y-2">
                  <p><strong>Nom commercial:</strong> {profile.business_name}</p>
                  {profile.siret_number && (
                    <p><strong>N° SIRET:</strong> {profile.siret_number}</p>
                  )}
                  {profile.has_qualirepar_label && (
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Label QualiRépar
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Adresse</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <p>{profile.address}</p>
                    <p>{profile.postal_code} {profile.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {profile.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Réseaux sociaux</h3>
                <div className="space-y-3">
                  {profile.facebook_url && (
                    <div className="flex items-center space-x-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <a 
                        href={profile.facebook_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Facebook
                      </a>
                    </div>
                  )}
                  {profile.instagram_url && (
                    <div className="flex items-center space-x-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <a 
                        href={profile.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:underline"
                      >
                        Instagram
                      </a>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {profile.twitter_url && (
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      <a 
                        href={profile.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Twitter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-4">Types de réparations proposées</h3>
              <div className="flex flex-wrap gap-2">
                {profile.repair_types.map((type) => (
                  <Badge key={type} variant="outline" className="px-3 py-1">
                    {getRepairTypeLabel(type)}
                  </Badge>
                ))}
                {profile.repair_types.length === 0 && (
                  <p className="text-gray-500">Aucun type de réparation spécifié</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairerProfileModal;
