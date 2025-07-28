import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { generateRepairerProfilePath } from '@/utils/profileUtils';

const TestRepairerProfileButton: React.FC = () => {
  const navigate = useNavigate();

  const handleTestProfile = () => {
    // Naviguer vers un profil de réparateur existant avec URL SEO-friendly
    const repairerId = '46a7659f-a40c-42a3-9986-16b1b54eadb6';
    const businessName = 'Repair Express Pro'; // Nom d'exemple
    navigate(generateRepairerProfilePath(repairerId, businessName));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleTestProfile}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        🧪 Test Profil Réparateur
      </Button>
    </div>
  );
};

export default TestRepairerProfileButton;