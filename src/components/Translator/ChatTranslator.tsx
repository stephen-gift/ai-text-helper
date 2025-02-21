"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { MessageArea } from "./MessageAreaComponent";
import { InputComponent } from "./InputComponent";
import { useEffect } from "react";
import useChatStore from "../../../store";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "fr", name: "French" }
];

export default function ChatTranslator() {
  const { translate, detectLanguage, summarize } = useTranslation();
  const params = useParams();
  const router = useRouter();

  const chatId = params.chatId as string;

  useEffect(() => {
    useChatStore.getState().setTranslationService({
      translate,
      detectLanguage,
      summarize
    });
  }, [translate, detectLanguage, summarize]);

  const {
    chats,

    processingState,
    sendMessage,
    translate: tranalateMessage,
    summarize: summarizeMessage
  } = useChatStore();

  const currentChat = chats.find((chat) => chat.id === chatId);

  useEffect(() => {
    if (chatId && !currentChat) {
      setTimeout(() => {
        toast.error("Chat Not Found", {
          description: "Please create a valid chatroom first."
        });
      }, 100);

      router.push("/");
    }
  }, [chatId, currentChat, router]);

  if (chatId && !currentChat) {
    return null;
  }
  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <Card className="w-full max-w-7xl mx-auto flex flex-col h-full">
      <CardHeader>
        <CardTitle>Chat Translator</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-0">
        <MessageArea
          messagePairs={currentChat?.messagePairs || []}
          supportedLanguages={SUPPORTED_LANGUAGES}
          onTranslate={tranalateMessage}
          onSummarize={summarizeMessage}
          isProcessingMessage={processingState.isProcessing}
          processingState={processingState}
        />
      </CardContent>

      <CardFooter className="shrink-0 p-4 flex flex-col">
        <InputComponent
          onSendMessage={handleSendMessage}
          isProcessing={processingState.isProcessing}
        />
        <p className="text-xs text-gray-500 text-center w-full mt-2">
          Supports {SUPPORTED_LANGUAGES.map((l) => l.name).join(", ")}{" "}
          translation
        </p>
      </CardFooter>
    </Card>
  );
}
