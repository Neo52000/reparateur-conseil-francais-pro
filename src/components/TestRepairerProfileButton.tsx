import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TestRepairerProfileButton: React.FC = () => {
  const navigate = useNavigate();

  const handleTestProfile = () => {
    // Utiliser un ID de réparateur réel pour le test
    navigate('/repairer/46a7659f-a40c-42a3-9986-16b1b54eadb6');
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