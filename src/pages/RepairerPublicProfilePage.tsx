import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileAnalytics } from '@/hooks/analytics/useProfileAnalytics';
import { useQuoteAndAppointment } from '@/hooks/useQuoteAndAppointment';

// Components
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Profile sections
import ProfilePageHeader from '@/components/profile/seo/ProfilePageHeader';
import ProfileBasicView from '@/components/profile/seo/ProfileBasicView';
import ProfilePremiumView from '@/components/profile/seo/ProfilePremiumView';
import ProfileSidebar from '@/components/profile/seo/ProfileSidebar';
import ProfileClaimBanner from '@/components/profile/seo/ProfileClaimBanner';
import SimplifiedQuoteModal from '@/components/profile/seo/SimplifiedQuoteModal';
import PremiumAppointmentModal from '@/components/profile/seo/PremiumAppointmentModal';
import ProfileSchemaOrg from '@/components/profile/seo/ProfileSchemaOrg';
import ProfileBreadcrumbs from '@/components/profile/seo/ProfileBreadcrumbs';

const RepairerPublicProfilePage: React.FC = () => {
  const { city, repairerSlug } = useParams<{ city: string; repairerSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackProfileView, trackClaimClick, trackContactClick } = useProfileAnalytics();
  
  const [profile, setProfile] = useState<any>(null);
  const [repairer, setRepairer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (city && repairerSlug) {
      fetchProfileData();
    }
  }, [city, repairerSlug]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Décoder le slug pour récupérer le nom
      const decodedName = repairerSlug?.replace(/-/g, ' ');
      const decodedCity = city?.replace(/-/g, ' ');
      
      // Chercher d'abord dans repairer_profiles (fiches revendiquées)
      const { data: profileData, error: profileError } = await supabase
        .from('repairer_profiles')
        .select('*')
        .ilike('city', `%${decodedCity}%`)
        .ilike('business_name', `%${decodedName}%`)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setIsPremium(true);
        
        // Récupérer les infos du repairer associé si possible
        const { data: repairerData } = await supabase
          .from('repairers')
          .select('*')
          .eq('email', profileData.email)
          .maybeSingle();
        
        setRepairer(repairerData || profileData);
        
        trackProfileView({
          repairerId: profileData.id,
          profileView: true,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });
      } else {
        // Chercher dans repairers (fiches non revendiquées)
        const { data: repairerData, error: repairerError } = await supabase
          .from('repairers')
          .select('*')
          .ilike('city', `%${decodedCity}%`)
          .ilike('name', `%${decodedName}%`)
          .maybeSingle();

        if (repairerError || !repairerData) {
          console.error('Repairer not found');
          setLoading(false);
          return;
        }

        setRepairer(repairerData);
        setIsPremium(false);
        
        // Créer un profil basique à partir des données repairer
        const basicProfile = {
          id: repairerData.id,
          repairer_id: repairerData.id,
          business_name: repairerData.name || 'Réparateur',
          siret_number: null,
          description: null,
          address: repairerData.address || '',
          city: repairerData.city || '',
          postal_code: repairerData.postal_code || '',
          phone: repairerData.phone || '',
          email: repairerData.email || '',
          website: repairerData.website || null,
          has_qualirepar_label: false,
          repair_types: repairerData.services || [],
          profile_image_url: null,
          geo_lat: repairerData.lat,
          geo_lng: repairerData.lng,
          rating: repairerData.rating,
          review_count: repairerData.review_count,
          created_at: repairerData.created_at,
          updated_at: repairerData.updated_at
        };
        
        setProfile(basicProfile);
        
        trackProfileView({
          repairerId: repairerData.id,
          profileView: true,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallRepairer = () => {
    if (profile?.id) {
      trackContactClick(profile.id, 'phone');
    }
    
    if (profile?.phone) {
      window.open(`tel:${profile.phone}`, '_self');
    } else {
      window.open('tel:+33745062162', '_self');
    }
  };

  const handleRequestQuote = () => {
    setShowQuoteModal(true);
  };

  const handleBookAppointment = () => {
    if (isPremium) {
      setShowAppointmentModal(true);
    } else {
      // Pour les fiches basiques, on propose d'appeler
      toast({
        title: "Fonctionnalité Premium",
        description: "La prise de RDV en ligne est réservée aux réparateurs vérifiés. Appelez directement ce réparateur.",
      });
      handleCallRepairer();
    }
  };

  const handleClaimProfile = () => {
    if (profile?.id) {
      trackClaimClick(profile.id);
    }
    navigate('/repairer-auth');
  };

  // SEO metadata
  const pageTitle = profile 
    ? `${profile.business_name} - Réparateur à ${profile.city} | TopRéparateurs`
    : 'Profil Réparateur | TopRéparateurs';
  
  const pageDescription = profile
    ? `${profile.business_name}, réparateur de téléphones et smartphones à ${profile.city}. ${profile.rating ? `Note: ${profile.rating}/5.` : ''} Demandez un devis gratuit !`
    : 'Trouvez un réparateur de confiance près de chez vous.';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profil non trouvé</h1>
          <p className="text-muted-foreground mb-6">Ce réparateur n'existe pas ou n'est plus disponible.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="business.business" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href={`https://topreparateurs.fr/${city}/${repairerSlug}`} />
      </Helmet>

      <ProfileSchemaOrg profile={profile} isPremium={isPremium} />

      <div className="min-h-screen bg-background">
        {/* Header avec navigation */}
        <ProfilePageHeader 
          profile={profile}
          isPremium={isPremium}
          onBack={() => navigate(-1)}
        />

        {/* Breadcrumbs SEO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ProfileBreadcrumbs 
            city={profile.city} 
            businessName={profile.business_name}
          />
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2">
              {isPremium ? (
                <ProfilePremiumView
                  profile={profile}
                  onRequestQuote={handleRequestQuote}
                  onCallRepairer={handleCallRepairer}
                  onBookAppointment={handleBookAppointment}
                />
              ) : (
                <ProfileBasicView
                  profile={profile}
                  onRequestQuote={handleRequestQuote}
                  onCallRepairer={handleCallRepairer}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ProfileSidebar
                profile={profile}
                isPremium={isPremium}
                onClaimProfile={handleClaimProfile}
                onCallRepairer={handleCallRepairer}
              />
            </div>
          </div>

          {/* Banner de revendication pour fiches basiques */}
          {!isPremium && (
            <ProfileClaimBanner 
              profile={profile}
              onClaimProfile={handleClaimProfile}
            />
          )}
        </div>
      </div>

      {/* Modal de devis simplifié */}
      <SimplifiedQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        profile={profile}
        isPremium={isPremium}
      />

      {/* Modal de RDV (Premium uniquement) */}
      {isPremium && (
        <PremiumAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          profile={profile}
        />
      )}
    </>
  );
};

export default RepairerPublicProfilePage;
