import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ArrowRight, Video } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import Link from "next/link";

type StepType = {
  title: string;
  details: string;
};

type CodeExampleType = {
  title: string;
  code: string;
};

type ErrorType = "translation" | "detection" | "summarization";

interface TroubleshootingStepsProps {
  type: ErrorType;
}

interface NotSupportedComponentProps {
  isTranslationSupported?: boolean;
  isDetectionSupported?: boolean;
  isSummarizationSupported?: boolean;
  forceShowAll?: boolean;
}

const TroubleshootingSteps = ({ type }: TroubleshootingStepsProps) => {
  const steps: Record<ErrorType, StepType[]> = {
    translation: [
      {
        title: "Update Chrome to the latest version",
        details:
          "Your browser must be updated to Chrome version 131 or newer. Go to Chrome menu (⋮) → Help → About Google Chrome → Update if available"
      },
      {
        title: "Enable Translation API",
        details:
          "Type 'chrome://flags/#translation-api' in your address bar → Find 'Translation API' → Select 'Enabled' → Click 'Relaunch'"
      },
      {
        title: "Set up your preferred languages",
        details:
          "One of your languages must be either your browser's preferred language or one of these: English, Chinese (Simplified/Traditional), Japanese, Portuguese, Russian, Spanish, Turkish, Hindi, Vietnamese, or Bengali"
      },
      {
        title: "Check language pack availability",
        details:
          "Visit chrome://on-device-translation-internals/ to see available language packs and install them if needed"
      },
      {
        title: "Allow language pack downloads",
        details:
          "Ensure you have a stable internet connection as language packs need to be downloaded the first time you use them"
      }
    ],
    detection: [
      {
        title: "Update Chrome to the latest version",
        details:
          "First ensure you have the latest version of Chrome installed. You can check this by clicking the three dots menu → Help → About Google Chrome"
      },
      {
        title: "Enable Language Detection API",
        details:
          "Type 'chrome://flags/#language-detection-api' in your address bar → Find 'Language Detection API' → Select 'Enabled' from the dropdown menu"
      },
      {
        title: "Restart Chrome",
        details:
          "Click the 'Relaunch' button that appears at the bottom of your screen after enabling the feature"
      },
      {
        title: "Check available disk space",
        details:
          "The feature requires some free disk space to download necessary language detection models. Try freeing up some space if the feature still doesn't work"
      },
      {
        title: "Wait for model download",
        details:
          "When using the feature for the first time, your browser needs to download a small language detection model. Please ensure you have an active internet connection"
      }
    ],
    summarization: [
      {
        title: "Use Chrome Canary",
        details:
          "The Summarizer API requires Chrome Canary browser during the trial period"
      },
      {
        title: "Enable Optimization Guide",
        details:
          "Type 'chrome://flags/' in your address bar → Find 'Optimization Guide On Device' → Select 'Enabled ByPassPerfRequirement' → Click 'Relaunch'"
      },
      {
        title: "Download Optimization Guide",
        details:
          "Type 'chrome://components/' in your address bar → Find 'Optimization Guide On Device Model' → Click 'Check for update' → Wait for the 3GB download (approximately 40 minutes)"
      },
      {
        title: "Enable Summarization API",
        details:
          "Type 'chrome://flags/#summarization-api-for-gemini-nano' in your address bar → Select 'Enabled' → Click 'Relaunch'"
      },
      {
        title: "Test API Support in Console",
        details:
          "Press F12 or right-click anywhere → Select 'Inspect' → Click 'Console' tab → Copy and paste the test code provided below"
      },
      {
        title: "Download Summarizer Model",
        details:
          "If the API is supported, paste the download code in the console → Wait for the 2.35GB model download (approximately 30 minutes). You can download this alongside the Optimization Guide"
      },
      {
        title: "Check English content",
        details:
          "Currently, the Summarizer API only supports English text. Ensure your content is in English"
      }
    ]
  };

  const codeExamples: Record<ErrorType, CodeExampleType[]> = {
    summarization: [
      {
        title: "Test if API is supported:",
        code: "if ('ai' in self && 'summarizer' in self.ai) {\n  console.log('Summarizer API is supported');\n}"
      },
      {
        title: "Download and monitor progress:",
        code: "const summarizer = await ai.summarizer.create({\n  monitor(m) {\n    m.addEventListener('downloadprogress', (e) => {\n      console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);\n    });\n  }\n});"
      }
    ],
    translation: [],
    detection: []
  };

  return (
    <div className="space-y-4">
      {steps[type].map((step, index) => (
        <div
          key={index}
          className="bg-white/40 dark:bg-gray-800/40 rounded-lg p-3 border border-current border-opacity-20 dark:border-opacity-40"
        >
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-white dark:bg-gray-700 border flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <div className="space-y-1 overflow-hidden">
              <h5 className="font-medium text-sm sm:text-base break-words dark:text-gray-100">
                {step.title}
              </h5>
              <p className="text-xs sm:text-sm opacity-90 break-words dark:text-gray-300">
                {step.details}
              </p>
            </div>
          </div>
        </div>
      ))}

      {type === "summarization" && (
        <div className="mt-6 space-y-4">
          <h6 className="font-medium text-base sm:text-lg dark:text-gray-100">
            Test Codes for Console
          </h6>
          {codeExamples[type].map((example, index) => (
            <div
              key={index}
              className="bg-slate-800 dark:bg-gray-900 rounded-lg p-4"
            >
              <p className="text-white dark:text-gray-200 text-xs sm:text-sm mb-2">
                {example.title}
              </p>
              <pre className="bg-slate-900 dark:bg-gray-800 p-3 rounded text-xs sm:text-sm text-white dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> You can download both the Optimization
              Guide (3GB) and Summarizer API model (2.35GB) at the same time to
              save time. Total download time will be approximately 40 minutes
              with a good internet connection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoDemo = () => {
  // Convert Google Drive sharing URL to embed URL
  const getEmbedUrl = () => {
    return `https://drive.google.com/file/d/${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_VIDEO_ID}/preview`;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 text-base font-medium">
        <Video className="h-5 w-5" />
        <h2>How to Use This Application</h2>
      </div>
      <div className="relative w-full pt-[56.25%]">
        {" "}
        {/* 16:9 aspect ratio */}
        <iframe
          src={getEmbedUrl()}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const NotSupportedComponent = ({
  isTranslationSupported = true,
  isDetectionSupported = true,
  isSummarizationSupported = true,
  forceShowAll = false
}: NotSupportedComponentProps) => {
  const showTranslation = forceShowAll ? false : isTranslationSupported;
  const showDetection = forceShowAll ? false : isDetectionSupported;
  const showSummarization = forceShowAll ? false : isSummarizationSupported;
  return (
    <Card className="w-full max-w-2xl mx-auto dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="pt-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <VideoDemo />
        <Accordion type="single" collapsible className="space-y-4 w-full">
          {!showTranslation && (
            <AccordionItem
              value="translation"
              className="border rounded-lg overflow-hidden dark:border-gray-700"
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-amber-800 dark:text-amber-200 text-sm sm:text-base break-words">
                        Translation Not Available
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm break-words">
                        Your browser doesn&apos;t support the Translation API.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-amber-50/50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 text-sm sm:text-base">
                      How to resolve this issue:
                    </h4>
                    <TroubleshootingSteps type="translation" />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          )}

          {!showDetection && (
            <AccordionItem
              value="detection"
              className="border rounded-lg overflow-hidden dark:border-gray-700"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base break-words">
                        Language Detection Not Available
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm break-words">
                        Language detection features are not supported in your
                        current browser.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-200 dark:border-blue-800 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 text-sm sm:text-base">
                      How to resolve this issue:
                    </h4>
                    <TroubleshootingSteps type="detection" />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          )}

          {!showSummarization && (
            <AccordionItem
              value="summarization"
              className="border rounded-lg overflow-hidden dark:border-gray-700"
            >
              <div className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-purple-800 dark:text-purple-200 text-sm sm:text-base break-words">
                        Summarization Not Available
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm break-words">
                        Text summarization features are not supported in your
                        current browser.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-purple-50/50 dark:bg-purple-900/10 border-t border-purple-200 dark:border-purple-800 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3 text-sm sm:text-base">
                      How to resolve this issue:
                    </h4>
                    <TroubleshootingSteps type="summarization" />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          )}

          {showTranslation && showDetection && showSummarization && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  All Features Available
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Your browser supports all required features. You&apos;re good
                  to go!
                </p>
              </div>
            </div>
          )}
        </Accordion>

        {/* Add navigation between pages */}
        <div className="pt-4 flex justify-end space-x-4 text-sm">
          {forceShowAll ? (
            <Link
              href="/not-supported"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 group relative"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="">Check My Browser Support</span>
            </Link>
          ) : (
            <Link
              href="/not-supported/preview"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 group relative"
            >
              <span className="">View All Error States</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotSupportedComponent;
