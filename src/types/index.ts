export interface TranslatorInstance {
  translate: (text: string) => Promise<string>;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

export interface LanguageDetectorInstance {
  detect: (text: string) => Promise<LanguageDetectionResult[]>;
}

export interface SummarizationProgressEvent extends Event {
  loaded: number;
  total: number;
}

export interface SummarizerInstance {
  summarize: (text: string, options?: { context?: string }) => Promise<string>;
  summarizeStreaming?: (
    text: string,
    options?: { context?: string }
  ) => AsyncIterable<string>;
}

export type AIAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export interface AIDownloadMonitor {
  addEventListener: (
    event: "downloadprogress",
    callback: (event: SummarizationProgressEvent) => void
  ) => void;
}

export interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  humanReadableName: string;
}

export interface SummarizationOptions {
  sharedContext?: string;
  type?: "key-points" | "tldr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
}

export interface LanguageDetectorOptions {
  expectedInputLanguages?: string[];
}

export interface SummarizationResult {
  summary: string;
  status: "success" | "error";
  error?: string;
}
