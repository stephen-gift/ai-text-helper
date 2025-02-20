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
type TranslatorInstance = any;
type LanguageDetectorInstance = any;

interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  humanReadableName: string;
}

interface SummarizationOptions {
  sharedContext?: string;
  type?: "key-points" | "tl;dr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
}

interface SummarizationResult {
  summary: string;
  status: "success" | "error";
  error?: string;
}

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
  const [summarizerInstance, setSummarizerInstance] = useState<any>(null);

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

  // Get or create translator instance
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

        // Create a new translator instance
        const translator = await (window as any).translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });

        // Cache the instance
        setTranslatorInstances((prev) => {
          const newMap = new Map(prev);
          newMap.set(instanceKey, translator);
          return newMap;
        });

        return translator;
      } catch (error: any) {
        showErrorToast(
          "Translation error",
          error.message || "Failed to initialize translator"
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
      } catch (error: any) {
        showErrorToast(
          "Translation failed",
          error.message || "Failed to translate text"
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

        // Create options object with expected languages if provided
        const options: Record<string, any> = {};
        if (expectedLanguages && expectedLanguages.length > 0) {
          options.expectedLanguages = expectedLanguages;
        }

        // Create a new detector instance
        const detector = await self.ai.languageDetector.create(options);
        setDetectorInstance(detector);
        return detector;
      } catch (error: any) {
        showErrorToast(
          "Detection error",
          error.message || "Failed to initialize language detector"
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
      } catch (error: any) {
        showErrorToast(
          "Language detection failed",
          error.message || "Failed to detect language"
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

        const available = (await self.ai.summarizer.capabilities()).available;
        if (available === "no") {
          showErrorToast(
            "Summarization API not available",
            "The Summarization API is not usable on this device."
          );
          return null;
        }

        const summarizer = await self.ai.summarizer.create(options);
        if (available !== "readily") {
          summarizer.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
          await summarizer.ready;
        }

        setSummarizerInstance(summarizer);
        return summarizer;
      } catch (error: any) {
        showErrorToast(
          "Summarization error",
          error.message || "Failed to initialize summarizer"
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
      } catch (error: any) {
        showErrorToast(
          "Summarization failed",
          error.message || "Failed to summarize text"
        );

        return { summary: text, status: "error", error: error.message };
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
      } catch (error: any) {
        showErrorToast(
          "Streaming summarization failed",
          error.message || "Failed to summarize text in real-time"
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
