"use client";

import { Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// Type Definitions
type Language = "es" | "fr" | "de";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  translation?: string;
  summary?: string;
  language?: Language;
}

interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

interface SummaryResponse {
  summary: string;
}

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a new message
  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: uuidv4(),
        text: `Response to: ${input}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  // Handle translation
  const handleTranslate = async (
    messageIndex: number,
    language: Language
  ): Promise<void> => {
    const updatedMessages = [...messages];
    const message = updatedMessages[messageIndex];

    try {
      // Simulate translation API call
      const translationResponse: TranslationResponse = {
        translatedText: `Translated to ${language}: ${message.text}`,
        detectedLanguage: "en"
      };

      message.translation = translationResponse.translatedText;
      message.language = language;
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };

  // Handle summarization
  const handleSummarize = async (messageIndex: number): Promise<void> => {
    const updatedMessages = [...messages];
    const message = updatedMessages[messageIndex];

    try {
      // Simulate summarization API call
      const summaryResponse: SummaryResponse = {
        summary: `Summary: ${message.text.slice(0, 50)}...`
      };

      message.summary = summaryResponse.summary;
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-9rem)]  overflow-hidden border rounded-lg p-2 md:p-4 bg-glass backdrop-blur-lg shadow-lg">
      <div className="flex flex-col h-full min-h-[calc(100vh-12rem)] overflow-auto">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                } ${index === messages.length - 1 ? "mb-4" : ""}`}
              >
                {/* User Message */}
                {message.isUser && (
                  <motion.div
                    className="flex items-start"
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                  >
                    <div className="chat-bubble max-w-[280px] md:max-w-md px-4 py-2 rounded-lg shadow-sm bg-blue-500/80 text-white self-end backdrop-blur-sm">
                      <p className="break-words">{message.text}</p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full ml-2 shrink-0">
                      <Avatar>
                        <AvatarImage src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </div>
                  </motion.div>
                )}

                {/* AI Message */}
                {!message.isUser && (
                  <motion.div
                    className="flex items-start"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 shrink-0">
                      <Image
                        src="/images/Logo.svg"
                        alt="AI Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>

                    <div className="flex flex-col justify-start items-start max-w-[280px] md:max-w-md">
                      <div className="chat-bubble px-4 py-2 rounded-lg shadow-sm bg-gray-100/80 text-gray-800 backdrop-blur-sm">
                        <p className="break-words">{message.text}</p>

                        <AnimatePresence mode="wait">
                          {message.summary && (
                            <motion.div
                              key={`summary-${message.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2"
                            >
                              <p className="text-sm font-semibold">Summary:</p>
                              <p>{message.summary}</p>
                            </motion.div>
                          )}

                          {message.translation && (
                            <motion.div
                              key={`translation-${message.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2"
                            >
                              <p className="text-sm font-semibold">
                                Translation:
                              </p>
                              <p>{message.translation}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Select
                          onValueChange={(value: Language) =>
                            handleTranslate(index, value)
                          }
                        >
                          <SelectTrigger className="w-[140px] md:w-[180px] bg-white/80 backdrop-blur-sm">
                            <SelectValue placeholder="Translate..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>

                        {message.text.length > 100 && !message.summary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSummarize(index)}
                            className="bg-white/80 backdrop-blur-sm"
                          >
                            Summarize
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        {/* Input Section */}
        <div className="flex gap-2 px-2">
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/80 backdrop-blur-sm min-h-[60px] max-h-[120px]"
            disabled={isLoading}
            aria-label="Type your message"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="self-end"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
