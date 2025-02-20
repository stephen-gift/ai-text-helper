import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputComponentProps {
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
}

export function InputComponent({
  onSendMessage,
  isProcessing
}: InputComponentProps) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    await onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex w-full flex-row items-center gap-2 rounded-[99px] border border-gray-900/10 bg-gray-900/5 p-2">
      <div className="flex"></div>

      <form onSubmit={handleSubmit} className="relative flex-1">
        <Textarea
          placeholder="Your Message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
          rows={1}
          className={cn(
            "min-h-10 h-10 w-full resize-none overflow-Visible scrollbar-hide py-2.5 px-3",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "border-0 shadow-none bg-transparent",
            "placeholder:text-blue-gray-300",
            "text-sm font-normal text-blue-gray-700",
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
        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-full text-center align-middle transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50"
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || !inputText.trim()}
      >
        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <Send size={14} color={inputText.trim() ? "#3B82F6" : "#90A4AE"} />
        </span>
      </button>
    </div>
  );
}
