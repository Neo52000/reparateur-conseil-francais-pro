
import { Repairer } from '@/types/repairer';

export const createPopupContent = (repairer: Repairer): string => {
  const displayPrice = repairer.price_range === 'low' ? '€' : repairer.price_range === 'medium' ? '€€' : '€€€';
  
  return `
    <div class="p-4 min-w-[280px]">
      <h3 class="font-semibold text-lg mb-2">${repairer.name}</h3>
      <p class="text-sm text-gray-600 mb-3">${repairer.address}, ${repairer.city}</p>
      ${repairer.rating ? `
        <div class="flex items-center mb-3">
          <span class="text-yellow-500 mr-1">★</span>
          <span class="text-sm">${repairer.rating}/5 (${repairer.review_count || 0} avis)</span>
        </div>
      ` : ''}
      <div class="text-sm space-y-1">
        <p><strong>Services:</strong> ${repairer.services && repairer.services.length > 0 ? repairer.services.join(', ') : 'Réparation générale'}</p>
        <p><strong>Prix:</strong> ${displayPrice}</p>
        ${repairer.response_time ? `<p><strong>Temps de réponse:</strong> ${repairer.response_time}</p>` : ''}
        ${repairer.phone ? `<p><strong>Téléphone:</strong> ${repairer.phone}</p>` : ''}
      </div>
      <div class="mt-3 pt-3 border-t">
        <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors" onclick="window.parent.postMessage({type: 'viewProfile', repairerId: '${repairer.id}'}, '*')">
          Voir le profil
        </button>
      </div>
    </div>
  `;
};
