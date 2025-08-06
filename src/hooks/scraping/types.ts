
export interface RepairerResult {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  services: string[];
  price_range: string;
  source: string;
  is_verified: boolean;
  rating?: number;
  scraped_at: string;
}

export interface UseScrapingResultsReturn {
  results: RepairerResult[];
  loading: boolean;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  loadResults: () => void;
  handleChangeStatusSelected: (status: "verified" | "unverified") => Promise<void>;
  handleDeleteSelected: () => Promise<void>;
}
