"use client";

import { toast } from "@/hooks/use-toast";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";

// Types
interface TranslatorInstance {
  translate: (text: string) => Promise<string>;
}

interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

interface LanguageDetectorInstance {
  detect: (text: string) => Promise<LanguageDetectionResult[]>;
}

// interface SummarizationOptions {
//   [key: string]: any; // Define specific summarization options if available
// }

interface SummarizationProgressEvent extends Event {
  loaded: number;
  total: number;
}

interface SummarizerInstance {
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

interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  humanReadableName: string;
}

interface TranslationAPI {
  createTranslator: (options: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<TranslatorInstance>;
}

interface CustomWindow extends Window {
  translation?: TranslationAPI;
}

declare const window: CustomWindow;

interface SummarizationOptions {
  sharedContext?: string;
  type?: "key-points" | "tl;dr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
}

interface LanguageDetectorOptions {
  expectedLanguages?: string[];
  confidenceThreshold?: number;
  mode?: "fast" | "accurate";
}

interface SummarizationResult {
  summary: string;
  status: "success" | "error";
  error?: string;
}

interface AIFactoryCapabilities {
  available: "no" | "readily" | "after-download";
  requirements?: {
    storage?: number;
    memory?: number;
    processingPower?: "low" | "medium" | "high";
  };
}

interface AIFactory<T> {
  capabilities?: () => Promise<AIFactoryCapabilities>;
  availability?: () => Promise<{
    status: "available" | "unavailable" | "downloading";
    progress?: number;
  }>;
  create: (
    options?: SummarizationOptions | LanguageDetectorOptions
  ) => Promise<T>;
}

interface AI {
  languageDetector?: AIFactory<LanguageDetectorInstance>;
  summarizer?: AIFactory<SummarizerInstance>;
  translator?: AIFactory<TranslatorInstance>;
}

interface CustomWindow extends Window {
  ai?: AI;
}

declare const self: CustomWindow;

interface TranslationContextType {
  // Translator functions
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<string>;

  preferredTargetLanguage: string;
  setPreferredTargetLanguage: (language: string) => void;

  // Language detector functions
  detectLanguage: (
    text: string,
    expectedLanguages?: string[]
  ) => Promise<DetectionResult | null>;
  languageTagToHumanReadable: (
    languageTag: string,
    targetLanguage?: string
  ) => string;

  // Service status
  isTranslationSupported: boolean;
  isDetectionSupported: boolean;

  // New summarization methods
  isSummarizationSupported: boolean;
  summarize: (
    text: string,
    options?: SummarizationOptions,
    context?: string
  ) => Promise<SummarizationResult>;
  summarizeStreaming: (
    text: string,
    options?: SummarizationOptions,
    context?: string
  ) => AsyncIterable<string>;
}

const showErrorToast = (title: string, description: string) => {
  toast({ title, description, variant: "destructive" });
};

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

// Storage key for preferred language
const STORAGE_KEY = "preferred-target-language";

// Provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  // State for service availability
  const [isTranslationSupported, setIsTranslationSupported] = useState(false);
  const [isDetectionSupported, setIsDetectionSupported] = useState(false);
  const [isSummarizationSupported, setIsSummarizationSupported] =
    useState(false);

  // State for saved instances
  const [translatorInstances, setTranslatorInstances] = useState<
    Map<string, TranslatorInstance>
  >(new Map());
  const [detectorInstance, setDetectorInstance] =
    useState<LanguageDetectorInstance | null>(null);
  const [summarizerInstance, setSummarizerInstance] =
    useState<SummarizerInstance | null>(null);

  // State for user preferences
  const [preferredTargetLanguage, setPreferredLanguageState] =
    useState<string>("en");

  // Check API availability on mount
  useEffect(() => {
    const checkAvailability = () => {
      const translationApiExists = "ai" in self;
      const translatorExists =
        translationApiExists && "translator" in (self.ai ?? {});
      const detectorExists =
        translationApiExists && "languageDetector" in (self.ai ?? {});
      const summarizerExists =
        translationApiExists && "summarizer" in (self.ai ?? {});

      setIsTranslationSupported(translatorExists);
      setIsDetectionSupported(detectorExists);
      setIsSummarizationSupported(summarizerExists);
    };

    checkAvailability();

    // Load preferred language from storage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) || "en";
      setPreferredLanguageState(saved);
    }

    // Cleanup on unmount
    return () => {
      translatorInstances.clear();
      setDetectorInstance(null);
      setSummarizerInstance(null);
    };
  }, [translatorInstances]);

  // Set preferred language with localStorage persistence
  const setPreferredTargetLanguage = useCallback((language: string) => {
    setPreferredLanguageState(language);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, []);

  const getTranslator = useCallback(
    async (
      sourceLanguage: string,
      targetLanguage: string
    ): Promise<TranslatorInstance | null> => {
      try {
        if (!isTranslationSupported) {
          showErrorToast(
            "Translation API not supported",
            "Your browser doesn't support the Translation API"
          );
          return null;
        }

        // Create a unique key for this language pair
        const instanceKey = `${sourceLanguage}-${targetLanguage}`;

        // Return cached instance if it exists
        if (translatorInstances.has(instanceKey)) {
          return translatorInstances.get(instanceKey) || null;
        }

        // Check if the requested language pair is available
        const supportedPairs = [
          "en-ja",
          "ja-en",
          "en-es",
          "es-en",
          "en-pt",
          "pt-en",
          "en-ru",
          "ru-en",
          "en-tr",
          "tr-en",
          "en-fr",
          "fr-en",
          "es-ja",
          "ja-es",
          "es-pt",
          "pt-es",
          "es-ru",
          "ru-es",
          "es-tr",
          "tr-es",
          "es-fr",
          "fr-es",
          "pt-ja",
          "ja-pt",
          "pt-ru",
          "ru-pt",
          "pt-tr",
          "tr-pt",
          "pt-fr",
          "fr-pt",
          "ru-ja",
          "ja-ru",
          "ru-tr",
          "tr-ru",
          "ru-fr",
          "fr-ru",
          "tr-ja",
          "ja-tr",
          "tr-fr",
          "fr-tr",
          "fr-ja",
          "ja-fr"
        ];

        if (!supportedPairs.includes(instanceKey)) {
          showErrorToast(
            "Unsupported language pair",
            "Currently, we support translations between English, Spanish, Portuguese, Russian, Turkish, French, and Japanese."
          );
          return null;
        }

        // ✅ Correctly initialize translator
        if (!window.translation) {
          throw new Error("Translation API is not available");
        }

        const translator = await window.translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });

        // ✅ Update state correctly using functional update
        setTranslatorInstances((prev) => {
          const newMap = new Map(prev);
          newMap.set(instanceKey, translator);
          return newMap;
        });

        return translator;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Translation error",
          errorMessage || "Failed to initialize translator"
        );
        return null;
      }
    },
    [isTranslationSupported, translatorInstances]
  );

  // Translation function
  const translate = useCallback(
    async (
      text: string,
      sourceLanguage: string,
      targetLanguage: string
    ): Promise<string> => {
      try {
        if (!text.trim()) return "";

        const translator = await getTranslator(sourceLanguage, targetLanguage);
        if (!translator) return text;

        // Save preference
        setPreferredTargetLanguage(targetLanguage);

        return await translator.translate(text.trim());
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Translation failed",
          errorMessage || "Failed to translate text"
        );
        return text;
      }
    },
    [getTranslator, setPreferredTargetLanguage]
  );

  // Get or create detector instance
  const getDetector = useCallback(
    async (
      expectedLanguages?: string[]
    ): Promise<LanguageDetectorInstance | null> => {
      try {
        if (!isDetectionSupported) {
          showErrorToast(
            "Language detection not supported",
            "Your browser doesn't support the Language Detection API"
          );
          return null;
        }

        // Return existing instance if available
        if (detectorInstance) {
          return detectorInstance;
        }

        if (!self.ai || !self.ai.languageDetector) {
          throw new Error("Language Detection API is not available");
        }

        // Create options object with expected languages if provided
        const options: LanguageDetectorOptions = {};
        if (expectedLanguages && expectedLanguages.length > 0) {
          options.expectedLanguages = expectedLanguages;
        }

        // Create a new detector instance
        const detector = await self.ai.languageDetector.create(options);
        setDetectorInstance(detector);
        return detector;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Detection error",
          errorMessage || "Failed to initialize language detector"
        );
        return null;
      }
    },
    [isDetectionSupported, detectorInstance]
  );

  // Language detection function
  const detectLanguage = useCallback(
    async (
      text: string,
      expectedLanguages?: string[]
    ): Promise<DetectionResult | null> => {
      try {
        if (!text.trim()) return null;

        const detector = await getDetector(expectedLanguages);
        if (!detector) return null;

        const results = await detector.detect(text.trim());

        if (!results || results.length === 0) {
          return null;
        }

        const { detectedLanguage, confidence } = results[0];

        return {
          detectedLanguage,
          confidence,
          humanReadableName: languageTagToHumanReadable(detectedLanguage, "en")
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Language detection failed",
          errorMessage || "Failed to detect language"
        );

        return null;
      }
    },
    [getDetector]
  );

  // Human readable language name conversion
  const languageTagToHumanReadable = useCallback(
    (languageTag: string, targetLanguage: string = "en"): string => {
      try {
        const displayNames = new Intl.DisplayNames([targetLanguage], {
          type: "language"
        });
        return displayNames.of(languageTag) ?? languageTag;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message); // ✅ Safe access
        } else {
          console.log("An unknown error occurred.");
        }
        return languageTag; // Fallback for errors
      }
    },
    []
  );

  // Initialize summarizer
  const initializeSummarizer = useCallback(
    async (options: SummarizationOptions = {}) => {
      try {
        if (!isSummarizationSupported) {
          showErrorToast(
            "Summarization API not supported",
            "Your browser doesn't support the Summarization API"
          );
          return null;
        }

        const summarizerFactory = self.ai?.summarizer;
        if (!summarizerFactory) {
          showErrorToast(
            "Summarization API unavailable",
            "AI summarizer is not defined."
          );
          return null;
        }

        // Ensure self.ai and self.ai.summarizer exist before accessing

        const available = (await summarizerFactory.capabilities?.())?.available;
        if (available === "no") {
          showErrorToast(
            "Summarization API not available",
            "The Summarization API is not usable on this device."
          );
          return null;
        }

        const summarizer = await summarizerFactory.create(options);

        if (available !== "readily") {
          summarizer.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
          await summarizer.ready;
        }

        setSummarizerInstance(summarizer);
        return summarizer;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Summarization error",
          errorMessage || "Failed to initialize summarizer"
        );

        return null;
      }
    },
    [isSummarizationSupported]
  );

  // Non-streaming summarization
  const summarize = useCallback(
    async (
      text: string,
      options: SummarizationOptions = {},
      context?: string
    ): Promise<SummarizationResult> => {
      try {
        if (!text.trim()) {
          return { summary: "", status: "success" };
        }

        const summarizer =
          summarizerInstance || (await initializeSummarizer(options));
        if (!summarizer) {
          return {
            summary: text,
            status: "error",
            error: "Summarizer not available"
          };
        }

        const summary = await summarizer.summarize(text.trim(), { context });
        return { summary, status: "success" };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Summarization failed",
          errorMessage || "Failed to summarize text"
        );

        return {
          summary: text,
          status: "error",
          error: errorMessage
        };
      }
    },
    [summarizerInstance, initializeSummarizer]
  );

  // Streaming summarization
  const summarizeStreaming = useCallback(
    async function* (
      text: string,
      options: SummarizationOptions = {},
      context?: string
    ): AsyncIterable<string> {
      try {
        if (!text.trim()) {
          return;
        }

        const summarizer =
          summarizerInstance || (await initializeSummarizer(options));
        if (!summarizer) {
          return;
        }

        if (!summarizer.summarizeStreaming) {
          console.warn("Summarizer does not support streaming.");
          yield await summarizer.summarize(text.trim(), { context });
          return;
        }
        const stream = await summarizer.summarizeStreaming(text.trim(), {
          context
        });
        let result = "";
        let previousLength = 0;

        for await (const segment of stream) {
          const newContent = segment.slice(previousLength);
          yield newContent;
          previousLength = segment.length;
          result += newContent;
          console.log(result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Streaming summarization failed",
          errorMessage || "Failed to summarize text in real-time"
        );
      }
    },
    [summarizerInstance, initializeSummarizer]
  );

  // Context value
  const contextValue: TranslationContextType = {
    translate,
    preferredTargetLanguage,
    setPreferredTargetLanguage,
    detectLanguage,
    languageTagToHumanReadable,
    isTranslationSupported,
    isDetectionSupported,

    isSummarizationSupported,
    summarize,
    summarizeStreaming
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook for using translation context
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
