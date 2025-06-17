
import { RepairerResult } from '../types';

export const handleDataUpdate = (
  data: RepairerResult[],
  lastUpdateTime: string | null,
  isAutoRefresh: boolean,
  setResults: (updater: (prev: RepairerResult[]) => RepairerResult[]) => void,
  setLastUpdateTime: (time: string) => void
) => {
  if (data && data.length > 0) {
    const latestScrapedAt = data[0]?.scraped_at;
    
    // Mise à jour différentielle pour éviter les sauts
    if (latestScrapedAt !== lastUpdateTime) {
      if (isAutoRefresh && lastUpdateTime) {
        const newResults = data.filter(item => item.scraped_at > lastUpdateTime);
        if (newResults.length > 0) {
          console.log("[dataSync] 🆕 Nouvelles données détectées!", newResults.length);
          
          // Mise à jour différentielle : ajouter seulement les nouveaux
          setResults(prevResults => {
            const existingIds = new Set(prevResults.map(r => r.id));
            const uniqueNewResults = newResults.filter(r => !existingIds.has(r.id));
            return [...uniqueNewResults, ...prevResults].slice(0, 200);
          });
          
          return newResults.length;
        }
      } else {
        // Première charge ou refresh manuel
        setResults(() => [...(data || [])]);
      }
      setLastUpdateTime(latestScrapedAt);
    }
  } else {
    setResults(() => [...(data || [])]);
  }
  
  return 0;
};
