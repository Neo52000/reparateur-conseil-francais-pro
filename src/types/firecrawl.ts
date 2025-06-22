
export interface ErrorResponse {
  success: false;
  error: string;
}

export interface CrawlResult {
  success: true;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description?: string;
    };
  }[];
}

export type CrawlResponse = CrawlResult | ErrorResponse;

export interface ParsedRepairer {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  description: string;
  category: string;
}
