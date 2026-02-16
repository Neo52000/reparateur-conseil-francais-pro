import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ProfileSchemaOrgProps {
  profile: any;
  isPremium: boolean;
}

const ProfileSchemaOrg: React.FC<ProfileSchemaOrgProps> = ({ profile, isPremium }) => {
  // Auto-generate neutral description for unclaimed (Level 0) profiles
  const autoDescription = !isPremium
    ? `Réparateur de téléphones et smartphones à ${profile.city || 'votre ville'}. ${
        (profile.repair_types || []).length > 0 
          ? `Services détectés : ${(profile.repair_types as string[]).slice(0, 3).join(', ')}.` 
          : ''
      } Consultez les avis et demandez un devis gratuit sur TopRéparateurs.`
    : profile.description || `Réparateur de téléphones et smartphones à ${profile.city}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://topreparateurs.fr/${profile.city?.toLowerCase().replace(/\s+/g, '-')}/${profile.business_name?.toLowerCase().replace(/\s+/g, '-')}`,
    "name": profile.business_name,
    "description": autoDescription,
    "image": profile.profile_image_url || "https://topreparateurs.fr/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": isPremium ? profile.address : undefined,
      "addressLocality": profile.city,
      "postalCode": profile.postal_code,
      "addressCountry": "FR"
    },
    "geo": profile.geo_lat && profile.geo_lng ? {
      "@type": "GeoCoordinates",
      "latitude": profile.geo_lat,
      "longitude": profile.geo_lng
    } : undefined,
    "telephone": isPremium ? profile.phone : undefined,
    "email": isPremium ? profile.email : undefined,
    "url": profile.website || `https://topreparateurs.fr/${profile.city?.toLowerCase().replace(/\s+/g, '-')}/${profile.business_name?.toLowerCase().replace(/\s+/g, '-')}`,
    "priceRange": "€€",
    "aggregateRating": profile.rating ? {
      "@type": "AggregateRating",
      "ratingValue": profile.rating,
      "reviewCount": profile.review_count || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "openingHoursSpecification": isPremium && profile.opening_hours ? 
      generateOpeningHours(profile.opening_hours) : undefined,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services de réparation",
      "itemListElement": (profile.repair_types || []).map((service: string) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    },
    "sameAs": [
      profile.facebook_url,
      profile.instagram_url,
      profile.linkedin_url,
      profile.twitter_url
    ].filter(Boolean)
  };

  // Nettoyer les propriétés undefined
  const cleanSchema = JSON.parse(JSON.stringify(schemaData));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanSchema)}
      </script>
    </Helmet>
  );
};

function generateOpeningHours(hours: any) {
  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const specs: any[] = [];
  
  Object.entries(dayMap).forEach(([key, day]) => {
    const dayHours = hours[key];
    if (dayHours && !dayHours.closed) {
      if (dayHours.morning_open && dayHours.morning_close) {
        specs.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": day,
          "opens": dayHours.morning_open,
          "closes": dayHours.morning_close
        });
      }
      if (dayHours.afternoon_open && dayHours.afternoon_close) {
        specs.push({
          "@type": "OpeningHoursSpecification", 
          "dayOfWeek": day,
          "opens": dayHours.afternoon_open,
          "closes": dayHours.afternoon_close
        });
      }
    }
  });

  return specs.length > 0 ? specs : undefined;
}

export default ProfileSchemaOrg;
