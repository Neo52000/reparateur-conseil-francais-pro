
import { BusinessData } from '../types.ts';
import { pagesJaunesData } from './pages-jaunes-data.ts';
import { googlePlacesData } from './google-places-data.ts';

export const getSourceData = (source: string, departmentCode?: string): BusinessData[] => {
  if (source === 'pages_jaunes') {
    if (departmentCode && pagesJaunesData[departmentCode]) {
      return pagesJaunesData[departmentCode];
    } else {
      // Tous les départements
      return Object.values(pagesJaunesData).flat();
    }
  } else if (source === 'google_places') {
    return googlePlacesData;
  }
  
  return [];
};

export const getMassiveRepairersData = (source: string, testMode: boolean, departmentCode?: string): BusinessData[] => {
  const sourceData = getSourceData(source, departmentCode);
  
  // En mode test, limiter à 5 éléments mais avec plus de variété
  return testMode ? sourceData.slice(0, 5) : sourceData;
};
