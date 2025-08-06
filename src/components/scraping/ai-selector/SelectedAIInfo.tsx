
import React from 'react';
import { AIOption } from './types';

interface SelectedAIInfoProps {
  selectedAI: string;
  aiOptions: AIOption[];
}

const SelectedAIInfo: React.FC<SelectedAIInfoProps> = ({ selectedAI, aiOptions }) => {
  if (!selectedAI) return null;

  const selectedOption = aiOptions.find(ai => ai.id === selectedAI);
  if (!selectedOption) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <h4 className="font-semibold text-blue-900 mb-1">
        IA sélectionnée: {selectedOption.name}
      </h4>
      <p className="text-sm text-blue-700">
        Cette IA sera utilisée pour classifier et nettoyer les données lors du scraping.
      </p>
    </div>
  );
};

export default SelectedAIInfo;
