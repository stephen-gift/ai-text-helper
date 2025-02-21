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
  addEventListener: (
    event: "downloadprogress",
    callback: (event: SummarizationProgressEvent) => void
  ) => void;
  ready: Promise<void>;
  summarize: (text: string, options?: { context?: string }) => Promise<string>;
  summarizeStreaming?: (
    text: string,
    options?: { context?: string }
  ) => AsyncIterable<string>;
}

export interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  humanReadableName: string;
}

export interface SummarizationOptions {
  sharedContext?: string;
  type?: "key-points" | "tl;dr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
}

export interface LanguageDetectorOptions {
  expectedLanguages?: string[];
  confidenceThreshold?: number;
  mode?: "fast" | "accurate";
}

export interface SummarizationResult {
  summary: string;
  status: "success" | "error";
  error?: string;
}
