"use client";

import {
  DetectionResult,
  LanguageDetectorInstance,
  LanguageDetectorOptions,
  SummarizationOptions,
  SummarizationResult,
  SummarizerInstance,
  TranslatorInstance
} from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<string>;

  preferredTargetLanguage: string;
  setPreferredTargetLanguage: (language: string) => void;

  detectLanguage: (
    text: string,
    expectedLanguages?: string[]
  ) => Promise<DetectionResult | null>;
  languageTagToHumanReadable: (
    languageTag: string,
    targetLanguage?: string
  ) => string;

  isTranslationSupported: boolean;
  isDetectionSupported: boolean;

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

const showErrorToast = (
  title: string,
  description?: string,
  action?: { label: string; onClick: () => void }
) => {
  toast.error(title, {
    description: description || undefined,
    action
  });
};

const showSuccessToast = (
  title: string,
  description?: string,
  action?: { label: string; onClick: () => void }
) => {
  toast.success(title, {
    description: description || undefined,
    action
  });
};

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "preferred-target-language";

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [isTranslationSupported, setIsTranslationSupported] = useState(false);
  const [isDetectionSupported, setIsDetectionSupported] = useState(false);
  const [isSummarizationSupported, setIsSummarizationSupported] =
    useState(false);

  const router = useRouter();

  const [translatorInstances, setTranslatorInstances] = useState<
    Map<string, TranslatorInstance>
  >(new Map());
  const [detectorInstance, setDetectorInstance] =
    useState<LanguageDetectorInstance | null>(null);
  const [summarizerInstance, setSummarizerInstance] =
    useState<SummarizerInstance | null>(null);

  const [preferredTargetLanguage, setPreferredLanguageState] =
    useState<string>("en");

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

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) || "en";
      setPreferredLanguageState(saved);
    }

    return () => {
      translatorInstances.clear();
      setDetectorInstance(null);
      setSummarizerInstance(null);
    };
  }, [translatorInstances]);

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
            "Your browser doesn't support the Translation API",
            {
              label: "Learn More",
              onClick: () => router.push("/not-supported")
            }
          );
          return null;
        }

        const instanceKey = `${sourceLanguage}-${targetLanguage}`;

        if (translatorInstances.has(instanceKey)) {
          return translatorInstances.get(instanceKey) || null;
        }

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

        if (!window.translation) {
          throw new Error("Translation API is not available");
        }

        const translator = await window.translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });

        setTranslatorInstances((prev) => {
          const newMap = new Map(prev);
          newMap.set(instanceKey, translator);
          return newMap;
        });

        showSuccessToast(
          "Translator initialized",
          `Ready to translate from ${languageTagToHumanReadable(
            sourceLanguage
          )} to ${languageTagToHumanReadable(targetLanguage)}`
        );

        return translator;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Translation error",
          errorMessage || "Failed to initialize translator",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );
        return null;
      }
    },
    [isTranslationSupported, translatorInstances]
  );

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

        setPreferredTargetLanguage(targetLanguage);

        const translatedText = await translator.translate(text.trim());

        if (translatedText && translatedText !== text) {
          showSuccessToast(
            "Translation complete",
            `Translated from ${languageTagToHumanReadable(
              sourceLanguage
            )} to ${languageTagToHumanReadable(targetLanguage)}`
          );
        }

        return translatedText;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Translation failed",
          errorMessage || "Failed to translate text",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );
        return text;
      }
    },
    [getTranslator, setPreferredTargetLanguage]
  );

  const getDetector = useCallback(
    async (
      expectedLanguages?: string[]
    ): Promise<LanguageDetectorInstance | null> => {
      try {
        if (!isDetectionSupported) {
          showErrorToast(
            "Language detection not supported",
            "Your browser doesn't support the Language Detection API",
            {
              label: "Learn More",
              onClick: () => router.push("/not-supported")
            }
          );
          return null;
        }

        if (detectorInstance) {
          return detectorInstance;
        }

        if (!self.ai || !self.ai.languageDetector) {
          throw new Error("Language Detection API is not available");
        }

        const options: LanguageDetectorOptions = {};
        if (expectedLanguages && expectedLanguages.length > 0) {
          options.expectedLanguages = expectedLanguages;
        }

        const detector = await self.ai.languageDetector.create(options);
        setDetectorInstance(detector);

        showSuccessToast(
          "Language detector ready",
          "Language detection service initialized successfully"
        );

        return detector;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Detection error",
          errorMessage || "Failed to initialize language detector",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );
        return null;
      }
    },
    [isDetectionSupported, detectorInstance]
  );

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
        const humanReadableName = languageTagToHumanReadable(
          detectedLanguage,
          "en"
        );

        showSuccessToast(
          "Language detected",
          `Detected ${humanReadableName} with ${Math.round(
            confidence * 100
          )}% confidence`
        );

        return {
          detectedLanguage,
          confidence,
          humanReadableName
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Language detection failed",
          errorMessage || "Failed to detect language",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );

        return null;
      }
    },
    [getDetector]
  );

  const languageTagToHumanReadable = useCallback(
    (languageTag: string, targetLanguage: string = "en"): string => {
      try {
        const displayNames = new Intl.DisplayNames([targetLanguage], {
          type: "language"
        });
        return displayNames.of(languageTag) ?? languageTag;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        } else {
          console.log("An unknown error occurred.");
        }
        return languageTag;
      }
    },
    []
  );

  const initializeSummarizer = useCallback(
    async (options: SummarizationOptions = {}) => {
      try {
        if (!isSummarizationSupported) {
          showErrorToast(
            "Summarization API not supported",
            "Your browser doesn't support the Summarization API",
            {
              label: "Learn More",
              onClick: () => router.push("/not-supported")
            }
          );
          return null;
        }

        const summarizerFactory = self.ai?.summarizer;
        if (!summarizerFactory) {
          showErrorToast(
            "Summarization API unavailable",
            "AI summarizer is not defined.",
            {
              label: "Learn More",
              onClick: () => router.push("/not-supported")
            }
          );
          return null;
        }

        const available = (await summarizerFactory.capabilities?.())?.available;
        if (available === "no") {
          showErrorToast(
            "Summarization API not available",
            "The Summarization API is not usable on this device.",
            {
              label: "Learn More",
              onClick: () => router.push("/not-supported")
            }
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

        showSuccessToast(
          "Summarizer ready",
          "Text summarization service initialized successfully"
        );

        return summarizer;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Summarization error",
          errorMessage || "Failed to initialize summarizer",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );

        return null;
      }
    },
    [isSummarizationSupported]
  );

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

        if (summary && summary !== text) {
          showSuccessToast(
            "Summary created",
            `Successfully created a ${options.length || "standard"} summary`
          );
        }

        return { summary, status: "success" };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Summarization failed",
          errorMessage || "Failed to summarize text",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
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

          showSuccessToast(
            "Summary created",
            "Created summary in non-streaming mode"
          );

          return;
        }

        showSuccessToast(
          "Streaming started",
          "Generating summary in real-time"
        );

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

        if (result) {
          showSuccessToast(
            "Streaming complete",
            "Finished generating summary stream"
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(
          "Streaming summarization failed",
          errorMessage || "Failed to summarize text in real-time",
          {
            label: "Learn More",
            onClick: () => router.push("/not-supported")
          }
        );
      }
    },
    [summarizerInstance, initializeSummarizer]
  );

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

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
