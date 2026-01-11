
// Keyword Explorer types
export interface KeywordAnalysisResult {
  keyword: string;
  searchVolume: 'Low' | 'Medium' | 'High';
  keywordDifficulty: 'Easy' | 'Medium' | 'Hard';
  relatedKeywords: string[];
  serpAnalysis: string;
}

// On-Page Analyzer types
export interface OnPageAnalysisResult {
  summary: string;
  suggestions: string[];
  groundingUrls?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Global loading and error states
export interface AppState {
  loading: boolean;
  error: string | null;
}

export enum AppSection {
  KEYWORD_EXPLORER = 'KEYWORD_EXPLORER',
  ON_PAGE_ANALYZER = 'ON_PAGE_ANALYZER',
}
