"use client";

import { useTranslation } from "@/contexts/TranslationContext";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect
} from "react";
import { v4 as uuidv4 } from "uuid";

// Types definition
interface UserMessage {
  id: string;
  isUser: true;
  text: string;
  detectedLanguage?: {
    code: string;
    name: string;
    confidence: number;
  };
}

interface ResponseMessage {
  id: string;
  isUser: false;
  text: string;
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
}

interface MessagePair {
  userMessage: UserMessage;
  response: ResponseMessage;
}

interface Chat {
  id: string;
  messagePairs: MessagePair[];
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  processingState: {
    isProcessing: boolean;
    isTranslating: boolean;
    isSummarizing: boolean;
    currentProcessingId: string | null;
  };
}

// ChatContext Type
interface ChatContextType {
  chatState: ChatState;
  handleSendMessage: (text: string) => Promise<void>;
  handleTranslate: (
    responseId: string,
    targetLanguage: string
  ) => Promise<void>;
  handleSummarize: (
    responseId: string,
    options?: { type?: "key-points" | "tl;dr" | "teaser" | "headline" }
  ) => Promise<void>;
  isProcessingMessage: boolean;
  setMessageProcessingState: (
    isProcessing: boolean,
    type?: "translating" | "summarizing",
    id?: string | null
  ) => void;
}

// Create ChatContext
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [chatState, setChatState] = useState<ChatState>({
    chats: [],
    currentChatId: null,
    processingState: {
      isProcessing: false,
      isTranslating: false,
      isSummarizing: false,
      currentProcessingId: null
    }
  });

  const { translate, detectLanguage, summarize } = useTranslation();

  // Computed value for message processing state
  const isProcessingMessage = chatState.processingState.isProcessing;

  // Update processing state
  const setMessageProcessingState = useCallback(
    (
      isProcessing: boolean,
      type?: "translating" | "summarizing",
      id?: string | null
    ) => {
      setChatState((prevState) => ({
        ...prevState,
        processingState: {
          isProcessing,
          isTranslating: type === "translating" ? isProcessing : false,
          isSummarizing: type === "summarizing" ? isProcessing : false,
          currentProcessingId: isProcessing ? id || null : null
        }
      }));
    },
    []
  );

  // Handler for sending message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setMessageProcessingState(true);

      // Create user message
      const userMessageId = uuidv4();
      const userMessage: UserMessage = {
        id: userMessageId,
        isUser: true,
        text
      };

      // Detect language
      const detectedResult = await detectLanguage(text);
      if (detectedResult) {
        userMessage.detectedLanguage = {
          code: detectedResult.detectedLanguage,
          name: detectedResult.humanReadableName,
          confidence: detectedResult.confidence
        };
      }

      // Create response message
      const responseId = uuidv4();
      const responseMessage: ResponseMessage = {
        id: responseId,
        isUser: false,
        text: "What would you like to do with this text?",
        detectedLanguage: userMessage.detectedLanguage,
        processingState: {
          isTranslating: false,
          isSummarizing: false
        }
      };

      // Update state with new message pair
      setChatState((prevState) => {
        // Handle case when there's no current chat
        if (!prevState.currentChatId) {
          const newChatId = uuidv4();
          return {
            ...prevState,
            chats: [
              {
                id: newChatId,
                messagePairs: [{ userMessage, response: responseMessage }]
              }
            ],
            currentChatId: newChatId
          };
        }

        // Add to existing chat
        return {
          ...prevState,
          chats: prevState.chats.map((chat) =>
            chat.id === prevState.currentChatId
              ? {
                  ...chat,
                  messagePairs: [
                    ...chat.messagePairs,
                    { userMessage, response: responseMessage }
                  ]
                }
              : chat
          )
        };
      });

      setMessageProcessingState(false);
    },
    [detectLanguage, setMessageProcessingState]
  );

  // Handler for translation
  const handleTranslate = useCallback(
    async (responseId: string, targetLanguage: string) => {
      setMessageProcessingState(true, "translating", responseId);

      // Find the message pair containing this response
      const currentChat = chatState.chats.find(
        (c) => c.id === chatState.currentChatId
      );
      if (!currentChat) {
        setMessageProcessingState(false);
        return;
      }

      const messagePairIndex = currentChat.messagePairs.findIndex(
        (pair) => pair.response.id === responseId
      );
      if (messagePairIndex === -1) {
        setMessageProcessingState(false);
        return;
      }

      // Update processing state in the message
      setChatState((prevState) => ({
        ...prevState,
        chats: prevState.chats.map((chat) =>
          chat.id === prevState.currentChatId
            ? {
                ...chat,
                messagePairs: chat.messagePairs.map((pair, idx) =>
                  idx === messagePairIndex
                    ? {
                        ...pair,
                        response: {
                          ...pair.response,
                          processingState: {
                            ...pair.response.processingState,
                            isTranslating: true
                          }
                        }
                      }
                    : pair
                )
              }
            : chat
        )
      }));

      const messagePair = currentChat.messagePairs[messagePairIndex];
      const sourceLanguage = messagePair.userMessage.detectedLanguage?.code;
      if (!sourceLanguage) {
        setMessageProcessingState(false);
        return;
      }

      // Perform translation
      const translatedText = await translate(
        messagePair.userMessage.text,
        sourceLanguage,
        targetLanguage
      );

      // Update state with translation
      setChatState((prevState) => ({
        ...prevState,
        chats: prevState.chats.map((chat) =>
          chat.id === prevState.currentChatId
            ? {
                ...chat,
                messagePairs: chat.messagePairs.map((pair, idx) =>
                  idx === messagePairIndex
                    ? {
                        ...pair,
                        response: {
                          ...pair.response,
                          translation: translatedText,
                          processingState: {
                            ...pair.response.processingState,
                            isTranslating: false
                          }
                        }
                      }
                    : pair
                )
              }
            : chat
        )
      }));

      setMessageProcessingState(false);
    },
    [chatState, translate, setMessageProcessingState]
  );

  // Handler for summarization
  const handleSummarize = useCallback(
    async (
      responseId: string,
      options?: { type?: "key-points" | "tl;dr" | "teaser" | "headline" }
    ) => {
      setMessageProcessingState(true, "summarizing", responseId);

      // Find the message pair containing this response
      const currentChat = chatState.chats.find(
        (c) => c.id === chatState.currentChatId
      );
      if (!currentChat) {
        setMessageProcessingState(false);
        return;
      }

      const messagePairIndex = currentChat.messagePairs.findIndex(
        (pair) => pair.response.id === responseId
      );
      if (messagePairIndex === -1) {
        setMessageProcessingState(false);
        return;
      }

      // Update processing state in the message
      setChatState((prevState) => ({
        ...prevState,
        chats: prevState.chats.map((chat) =>
          chat.id === prevState.currentChatId
            ? {
                ...chat,
                messagePairs: chat.messagePairs.map((pair, idx) =>
                  idx === messagePairIndex
                    ? {
                        ...pair,
                        response: {
                          ...pair.response,
                          processingState: {
                            ...pair.response.processingState,
                            isSummarizing: true
                          }
                        }
                      }
                    : pair
                )
              }
            : chat
        )
      }));

      const messagePair = currentChat.messagePairs[messagePairIndex];
      const text = messagePair.userMessage.text;

      // Perform summarization
      const summaryResult = await summarize(text, {
        type: options?.type,
        format: "markdown",
        length: "medium"
      });

      // Update state with summary
      setChatState((prevState) => ({
        ...prevState,
        chats: prevState.chats.map((chat) =>
          chat.id === prevState.currentChatId
            ? {
                ...chat,
                messagePairs: chat.messagePairs.map((pair, idx) =>
                  idx === messagePairIndex
                    ? {
                        ...pair,
                        response: {
                          ...pair.response,
                          summary: summaryResult.summary,
                          processingState: {
                            ...pair.response.processingState,
                            isSummarizing: false
                          }
                        }
                      }
                    : pair
                )
              }
            : chat
        )
      }));

      setMessageProcessingState(false);
    },
    [chatState, summarize, setMessageProcessingState]
  );

  // Persist chats to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && chatState.chats.length > 0) {
      localStorage.setItem("chat-history", JSON.stringify(chatState.chats));
    }
  }, [chatState.chats]);

  // Load chats from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChats = localStorage.getItem("chat-history");
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats);
          setChatState((prev) => ({
            ...prev,
            chats: parsedChats,
            currentChatId: parsedChats.length > 0 ? parsedChats[0].id : null
          }));
        } catch (e) {
          console.error("Failed to parse saved chats:", e);
        }
      }
    }
  }, []);

  // Context value
  const contextValue: ChatContextType = {
    chatState,
    handleSendMessage,
    handleTranslate,
    handleSummarize,
    isProcessingMessage,
    setMessageProcessingState
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

// Custom hook for using chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
