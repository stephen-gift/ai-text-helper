import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
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
  forceShowAll?: boolean; // New prop
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
          className="bg-white/40 rounded-lg p-3 border border-current border-opacity-20"
        >
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-white border flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <div className="space-y-1 overflow-hidden">
              <h5 className="font-medium text-sm sm:text-base break-words">
                {step.title}
              </h5>
              <p className="text-xs sm:text-sm opacity-90 break-words">
                {step.details}
              </p>
            </div>
          </div>
        </div>
      ))}

      {type === "summarization" && (
        <div className="mt-6 space-y-4">
          <h6 className="font-medium text-base sm:text-lg">
            Test Codes for Console
          </h6>
          {codeExamples[type].map((example, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4">
              <p className="text-white text-xs sm:text-sm mb-2">
                {example.title}
              </p>
              <pre className="bg-slate-900 p-3 rounded text-xs sm:text-sm text-white overflow-x-auto whitespace-pre-wrap break-all">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs sm:text-sm text-blue-800">
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

const NotSupportedComponent = ({
  isTranslationSupported = true,
  isDetectionSupported = true,
  isSummarizationSupported = true,
  forceShowAll = false
}: NotSupportedComponentProps) => {
  // If forceShowAll is true, override all support flags to false
  const showTranslation = forceShowAll ? false : isTranslationSupported;
  const showDetection = forceShowAll ? false : isDetectionSupported;
  const showSummarization = forceShowAll ? false : isSummarizationSupported;
  return (
    <Card className="w-full max-w-2xl mx-auto ">
      <CardContent className="pt-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <Accordion type="single" collapsible className="space-y-4 w-full ">
          {!showTranslation && (
            <AccordionItem
              value="translation"
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-amber-50 border-amber-200">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-amber-800 text-sm sm:text-base break-words">
                        Translation Not Available
                      </h3>
                      <p className="text-amber-700 text-xs sm:text-sm break-words">
                        Your browser doesn&apos;t support the Translation API.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-amber-50/50 border-t border-amber-200 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-amber-800 mb-3 text-sm sm:text-base">
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
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-blue-50 border-blue-200">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-blue-800 text-sm sm:text-base break-words">
                        Language Detection Not Available
                      </h3>
                      <p className="text-blue-700 text-xs sm:text-sm break-words">
                        Language detection features are not supported in your
                        current browser.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-blue-50/50 border-t border-blue-200 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-blue-800 mb-3 text-sm sm:text-base">
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
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-purple-50 border-purple-200">
                <AccordionTrigger className="px-2 sm:px-4 py-3 hover:no-underline w-full">
                  <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-medium text-purple-800 text-sm sm:text-base break-words">
                        Summarization Not Available
                      </h3>
                      <p className="text-purple-700 text-xs sm:text-sm break-words">
                        Text summarization features are not supported in your
                        current browser.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-purple-50/50 border-t border-purple-200 max-w-full">
                  <div className="px-2 sm:px-4 py-3 overflow-x-auto">
                    <h4 className="font-medium text-purple-800 mb-3 text-sm sm:text-base">
                      How to resolve this issue:
                    </h4>
                    <TroubleshootingSteps type="summarization" />
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          )}

          {showTranslation && showDetection && showSummarization && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-green-800">
                  All Features Available
                </h3>
                <p className="text-green-700 text-sm">
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
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 group relative"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="">Check My Browser Support</span>
            </Link>
          ) : (
            <Link
              href="/not-supported/preview"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 group relative"
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
