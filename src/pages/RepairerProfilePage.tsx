import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';
import { Repairer } from '@/types/repairer';
import { useToast } from '@/hooks/use-toast';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Shield, 
  Phone, 
  Clock,
  Award,
  MessageSquare
} from 'lucide-react';

// Enhanced profile components
import GoogleMapEmbed from '@/components/profile/GoogleMapEmbed';
import ContactInfoCard from '@/components/profile/ContactInfoCard';
import ClaimProfileCTA from '@/components/profile/ClaimProfileCTA';
import ClientSimplifiedProfile from '@/components/profile/ClientSimplifiedProfile';
import SimplifiedBlurredPhotos from '@/components/profile/SimplifiedBlurredPhotos';
import SimplifiedBlurredSections from '@/components/profile/SimplifiedBlurredSections';

const RepairerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [repairer, setRepairer] = useState<Repairer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfileData(id);
    }
  }, [id]);

  const fetchProfileData = async (repairerId: string) => {
    try {
      setLoading(true);
      
      // Fetch repairer basic data
      const { data: repairerData, error: repairerError } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .single();

      if (repairerError) {
        console.error('Error fetching repairer:', repairerError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du réparateur",
          variant: "destructive"
        });
        return;
      }

      setRepairer(repairerData as Repairer);

      // Check if repairer has claimed profile
      try {
        const { data: profileData } = await supabase
          .from('repairer_profiles')
          .select('*')
          .eq('repairer_id', repairerId)
          .single();
        
        if (profileData) {
          setProfile(profileData as any);
          setIsClaimed(true);
        }
      } catch (profileError) {
        // Create basic profile from repairer data
        const basicProfile = {
          id: repairerData.id,
          repairer_id: repairerId,
          business_name: repairerData.name,
          siret_number: null,
          description: null,
          address: repairerData.address,
          city: repairerData.city,
          postal_code: repairerData.postal_code,
          phone: repairerData.phone || '',
          email: repairerData.email || '',
          website: repairerData.website || null,
          facebook_url: null,
          instagram_url: null,
          linkedin_url: null,
          twitter_url: null,
          whatsapp_url: null,
          telegram_url: null,
          tiktok_url: null,
          has_qualirepar_label: false,
          repair_types: repairerData.services || [],
          profile_image_url: null,
          geo_lat: repairerData.lat,
          geo_lng: repairerData.lng,
          created_at: repairerData.created_at,
          updated_at: repairerData.updated_at
        };
        
        setProfile(basicProfile as any);
        setIsClaimed(false);
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallRepairer = () => {
    if (isClaimed && profile?.phone) {
      window.open(`tel:${profile.phone}`, '_self');
    } else {
      // Default contact
      window.open('tel:+33745062162', '_self');
    }
  };

  const handleClaimProfile = () => {
    navigate('/repairer/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile || !repairer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
          <p className="text-gray-600 mb-6">Ce réparateur n'existe pas ou n'est plus disponible.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Determine if this is a basic (unclaimed) profile
  const isBasicProfile = !isClaimed || (!profile.description && !profile.siret_number && !profile.years_experience);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux résultats
            </Button>
            
            <div className="flex items-center gap-2">
              {repairer.is_verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              )}
              {profile.has_qualirepar_label && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Award className="h-3 w-3 mr-1" />
                  QualiRépar
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* En-tête du profil */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {profile.business_name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.city} ({profile.postal_code})
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {repairer.rating ? `${repairer.rating}/5` : 'Nouveau'}
                        {repairer.review_count && (
                          <span className="text-gray-500">({repairer.review_count} avis)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCallRepairer}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                  {profile.repair_types.slice(0, 5).map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                  {profile.repair_types.length > 5 && (
                    <Badge variant="outline" className="text-gray-500">
                      +{profile.repair_types.length - 5} autres
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contenu conditionnel selon le statut de revendication */}
            {isBasicProfile ? (
              <ClientSimplifiedProfile 
                profile={profile}
                onCallRepairer={handleCallRepairer}
              />
            ) : (
              <>
                {/* Description */}
                {profile.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>À propos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Photos de l'atelier */}
                {profile.shop_photos && profile.shop_photos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Photos de l'atelier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {profile.shop_photos.map((photo, index) => (
                          <div key={index} className="aspect-video rounded-lg overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Services détaillés */}
                {profile.services_offered && profile.services_offered.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Services proposés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.services_offered.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <ContactInfoCard 
              profile={profile}
              isBlurred={!isClaimed}
              onClaimProfile={handleClaimProfile}
            />

            {/* Carte de localisation */}
            <GoogleMapEmbed 
              profile={profile}
              isBlurred={!isClaimed}
            />

            {/* Horaires d'ouverture */}
            {profile.opening_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {/* Affichage simple des horaires */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Lun - Ven</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span>9h00 - 17h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="text-red-600">Fermé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Call-to-action pour revendication */}
        {!isClaimed && (
          <div className="mt-8">
            <ClaimProfileCTA profile={profile} variant="banner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairerProfilePage;