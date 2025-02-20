"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { NotSupportedComponent } from "@/components/Error/NotSupported";
import { MessageArea } from "./MessageAreaComponent";
import { InputComponent } from "./InputComponent";
import { useEffect } from "react";
import useChatStore from "../../../store";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "fr", name: "French" }
];

export default function ChatTranslator() {
  const {
    translate,
    detectLanguage,
    summarize,
    isTranslationSupported,
    isDetectionSupported,
    isSummarizationSupported
  } = useTranslation();

  // Initialize translation service in the store
  useEffect(() => {
    useChatStore.getState().setTranslationService({
      translate,
      detectLanguage,
      summarize
    });
  }, [translate, detectLanguage, summarize]);

  const {
    chats,
    currentChatId,
    processingState,
    sendMessage,
    translate: tranalateMessage,
    summarize: summarizeMessage
  } = useChatStore();

  // Check API support
  if (
    !isTranslationSupported ||
    !isDetectionSupported ||
    !isSummarizationSupported
  ) {
    return <NotSupportedComponent />;
  }

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <Card className="w-full p-2 max-w-7xl mx-auto h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat Translator</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
        <MessageArea
          messagePairs={currentChat?.messagePairs || []}
          supportedLanguages={SUPPORTED_LANGUAGES}
          onTranslate={tranalateMessage}
          onSummarize={summarizeMessage}
          isProcessingMessage={processingState.isProcessing}
          processingState={processingState}
        />
      </CardContent>

      <InputComponent
        onSendMessage={sendMessage}
        isProcessing={processingState.isProcessing}
      />

      <CardFooter className="text-xs text-gray-500 text-center w-full">
        Supports {SUPPORTED_LANGUAGES.map((l) => l.name).join(", ")} translation
      </CardFooter>
    </Card>
  );
}
