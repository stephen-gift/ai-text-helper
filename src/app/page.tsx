"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useChatStore from "../../store";
import Image from "next/image";
import { MessageSquarePlus } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { createNewChat } = useChatStore();

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      router.push(`/chat/${newChatId}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      {/* Header */}
      <div className="text-center px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3">
          <Image
            src="/images/Logo.svg"
            alt="Logo"
            width={36}
            height={36}
            priority
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Welcome to Translation Chat
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2">
          How Can I Help You Today
        </p>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">
          Start a new conversation to translate and summarize text in multiple
          languages.
        </p>
      </div>

      {/* New Chat Button - Fixed at Bottom */}
      <div className="p-3 md:p-4 flex justify-center w-full">
        <Button
          className="w-full max-w-md py-2 md:py-3 text-base md:text-lg font-semibold flex items-center justify-center gap-2 group"
          onClick={handleNewChat}
        >
          <MessageSquarePlus className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
          New Chat
        </Button>
      </div>
    </div>
  );
}
