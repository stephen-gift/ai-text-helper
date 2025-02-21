import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useUserStore } from "../../../store";
import { toast } from "sonner";
import { SettingsDrawer } from "../General/SettingsDrawer";

interface MessageAreaProps {
  messagePairs: Array<{
    userMessage: {
      id: string;
      text: string;
      isUser: true;
      detectedLanguage?: {
        code: string;
        name: string;
        confidence: number;
      };
    };
    response: {
      id: string;
      text: string;
      isUser: false;
      detectedLanguage?: {
        code: string;
        name: string;
        confidence: number;
      };
      translation?: string;
      summary?: string;
      processingState: {
        isTranslating: boolean;
        isSummarizing: boolean;
      };
    };
  }>;
  supportedLanguages: Array<{ code: string; name: string }>;
  onTranslate: (responseId: string, targetLanguage: string) => Promise<void>;
  onSummarize: (responseId: string) => Promise<void>;
  isProcessingMessage: boolean;
  processingState: {
    isProcessing: boolean;
    isTranslating: boolean;
    isSummarizing: boolean;
    currentProcessingId: string | null;
  };
}

export function MessageArea({
  messagePairs,
  supportedLanguages,
  onTranslate,
  onSummarize,
  processingState
}: MessageAreaProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<
    Record<string, string>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  const handleLanguageSelect = (messageId: string, language: string) => {
    setSelectedLanguages((prev) => ({
      ...prev,
      [messageId]: language
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: `${type} has been copied to your clipboard.`,
      duration: 2000
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messagePairs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messagePairs.map(({ userMessage, response }) => (
        <div key={`message-pair-${userMessage.id}`} className="space-y-4">
          {/* User Message */}
          <motion.div
            key={userMessage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="flex justify-end"
          >
            <motion.div
              className="flex items-end justify-end "
              initial={{ x: 20 }}
              animate={{ x: 0 }}
            >
              <div className="chat-bubble h-full w-[70%] px-4 py-2 rounded-2xl rounded-br-none shadow-sm bg-blue-500/80 text-white self-start backdrop-blur-sm ">
                <p className="break-words ">{userMessage.text}</p>
                {userMessage.detectedLanguage && (
                  <p className="text-sm text-gray-200 mt-1">
                    Detected: {userMessage.detectedLanguage.name} (
                    {(userMessage.detectedLanguage.confidence * 100).toFixed(1)}
                    %)
                  </p>
                )}
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full ml-2 shrink-0">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          </motion.div>

          {/* Response Message */}
          <motion.div
            key={response.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <motion.div
              className="flex items-start"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0">
                <Image
                  src="/images/Logo.svg"
                  alt="AI Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col justify-start items-start w-[70%]">
                <div className="chat-bubble px-4 py-2 rounded-2xl rounded-tl-none shadow-sm bg-gray-100/80 text-gray-800 backdrop-blur-sm">
                  <p className="break-words">{response.text}</p>
                  {response.detectedLanguage && (
                    <p className="text-sm text-gray-600 mt-1">
                      Detected: {response.detectedLanguage.name} (
                      {(response.detectedLanguage.confidence * 100).toFixed(1)}
                      %)
                    </p>
                  )}
                  {response.translation && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200 relative group">
                      <div className="text-xs text-green-700 mb-1 flex justify-between items-center">
                        <span>Translation:</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              response.translation!,
                              "Translation"
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-green-100 rounded"
                        >
                          <Copy size={14} className="text-green-700" />
                        </button>
                      </div>
                      <p>{response.translation}</p>
                    </div>
                  )}
                  {response.summary && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200 relative group">
                      <div className="text-xs text-blue-700 mb-1 flex justify-between items-center">
                        <span>Summary:</span>
                        <button
                          onClick={() =>
                            copyToClipboard(response.summary!, "Summary")
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                        >
                          <Copy size={14} className="text-blue-700" />
                        </button>
                      </div>
                      <p>{response.summary}</p>
                    </div>
                  )}
                </div>

                {/* Translation and Summarization Controls */}
                <div className="flex flex-col space-y-2 mt-2 w-full md:w-auto">
                  <div className="flex flex-col md:flex-row gap-1 items-center">
                    <Select
                      value={selectedLanguages[response.id] || ""}
                      onValueChange={(lang) =>
                        handleLanguageSelect(response.id, lang)
                      }
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages
                          .filter(
                            (lang) =>
                              lang.code !== response.detectedLanguage?.code
                          )
                          .map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Button
                      className="w-full"
                      onClick={() =>
                        onTranslate(response.id, selectedLanguages[response.id])
                      }
                      disabled={
                        !selectedLanguages[response.id] ||
                        (processingState.isTranslating &&
                          processingState.currentProcessingId === response.id)
                      }
                    >
                      {processingState.isTranslating &&
                      processingState.currentProcessingId === response.id ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        "Translate"
                      )}
                    </Button>
                  </div>

                  {response.detectedLanguage?.code === "en" &&
                    userMessage.text.length > 150 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => onSummarize(response.id)}
                          disabled={
                            processingState.isSummarizing &&
                            processingState.currentProcessingId === response.id
                          }
                          className="flex-1"
                        >
                          {processingState.isSummarizing &&
                          processingState.currentProcessingId ===
                            response.id ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Summarizing...
                            </>
                          ) : (
                            "Summarize"
                          )}
                        </Button>

                        <SettingsDrawer />
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
