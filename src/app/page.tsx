"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useChatStore from "../../store";
import Image from "next/image";
import { InputComponent } from "@/components/Translator/InputComponent";

export default function Home() {
  const router = useRouter();
  const { createNewChat, sendMessage, setCurrentChatId } = useChatStore();

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      router.push(`/chat/${newChatId}`);
    }
  };
  const isProcessing: boolean = false;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      const newChatId = createNewChat();
      if (newChatId) {
        // Explicitly set as current chat
        setCurrentChatId(newChatId);

        // Send message first
        await sendMessage(text);

        // Navigate after message is sent
        router.push(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally add error handling UI here
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-3">
          <Image
            src="/images/Logo.svg"
            alt="Logo"
            width={32}
            height={32}
            priority
          />
          <h1 className="text-3xl font-bold">Welcome to Translation Chat</h1>
        </div>
        <p className="text-gray-600 text-lg">How Can I Help You Today</p>
        <p className="text-gray-600 text-lg">
          Start a new conversation to translate and summarize text in multiple
          languages.
        </p>
      </div>

      {/* New Chat Button - Fixed at Bottom */}
      <div className=" p-4 flex justify-center">
        <Button
          className="w-full max-w-md py-3 text-lg font-semibold"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
      </div>
      <InputComponent
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}
