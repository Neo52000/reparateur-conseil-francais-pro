import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Phone, Mail, CheckCircle } from 'lucide-react';
interface EnhancedClaimBannerProps {
  businessName: string;
}
const EnhancedClaimBanner: React.FC<EnhancedClaimBannerProps> = ({
  businessName
}) => {
  const handleClaimProfile = () => {
    window.open('tel:+33745062162', '_self');
  };
  const handleEmailContact = () => {
    const subject = encodeURIComponent(`Revendication de fiche - ${businessName}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite revendiquer la fiche de mon entreprise "${businessName}" sur votre plateforme.\n\nMerci de me contacter pour procéder à la vérification.\n\nCordialement.`);
    window.open(`mailto:contact@irreparable.fr?subject=${subject}&body=${body}`, '_self');
  };
  return;
};
export default EnhancedClaimBanner;