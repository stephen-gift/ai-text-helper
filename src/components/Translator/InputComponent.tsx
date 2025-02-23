import { useState } from "react";
import { PlusCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useChatStore from "../../../store";
import { Button } from "../ui/button";

interface InputComponentProps {
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  currentChatId: string | null;
  urlChatId: string | null;
}

export function InputComponent({
  onSendMessage,
  isProcessing,
  currentChatId,
  urlChatId
}: InputComponentProps) {
  const [inputText, setInputText] = useState("");

  const router = useRouter();

  const { createNewChat } = useChatStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    await onSendMessage(inputText);
    setInputText("");
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      toast.success("New chat created!", {
        description: "Starting fresh conversation..."
      });
      router.push(`/chat/${newChatId}`);
    } else {
      toast.error("Failed to create new chat", {
        description: "Please try again"
      });
    }
  };

  if (currentChatId !== urlChatId) {
    return (
      <Alert className="mx-2 bg-gray-50 dark:bg-gray-800/50 border border-blue-100 dark:border-blue-900">
        <AlertDescription className="flex flex-col gap-3">
          <div className="text-gray-700 dark:text-gray-200 text-center">
            Looking to start a conversation? This chat is from the past, but
            don&apos;t worry!
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <PlusCircle size={16} />
              Start fresh chat
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex w-full flex-row items-center gap-2 rounded-[99px] border border-gray-900/10 dark:border-gray-100/10 bg-gray-900/5 dark:bg-gray-100/5 p-2">
      <div className="flex"></div>

      <form onSubmit={handleSubmit} className="relative flex-1">
        <Textarea
          placeholder="Your Message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
          rows={1}
          className={cn(
            "min-h-10 h-10 w-full resize-none overflow-visible scrollbar-hide py-2.5 px-3",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "border-0 shadow-none bg-transparent",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "text-sm font-normal text-gray-700 dark:text-gray-200",
            "transition-all duration-200"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (inputText.trim()) {
                handleSubmit(e);
              }
            }
          }}
        />
      </form>

      <button
        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-full text-center align-middle transition-all hover:bg-gray-900/10 dark:hover:bg-gray-100/10 active:bg-gray-900/20 dark:active:bg-gray-100/20 disabled:pointer-events-none disabled:opacity-50"
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || !inputText.trim()}
      >
        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <Send
            size={14}
            className={cn(
              inputText.trim()
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            )}
          />
        </span>
      </button>
    </div>
  );
}
