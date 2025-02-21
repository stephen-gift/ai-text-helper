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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
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

  const isProcessingMessage = chatState.processingState.isProcessing;

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

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setMessageProcessingState(true);

      const userMessageId = uuidv4();
      const userMessage: UserMessage = {
        id: userMessageId,
        isUser: true,
        text
      };

      const detectedResult = await detectLanguage(text);
      if (detectedResult) {
        userMessage.detectedLanguage = {
          code: detectedResult.detectedLanguage,
          name: detectedResult.humanReadableName,
          confidence: detectedResult.confidence
        };
      }

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

      setChatState((prevState) => {
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

  const handleTranslate = useCallback(
    async (responseId: string, targetLanguage: string) => {
      setMessageProcessingState(true, "translating", responseId);

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

      const translatedText = await translate(
        messagePair.userMessage.text,
        sourceLanguage,
        targetLanguage
      );

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

  const handleSummarize = useCallback(
    async (
      responseId: string,
      options?: { type?: "key-points" | "tl;dr" | "teaser" | "headline" }
    ) => {
      setMessageProcessingState(true, "summarizing", responseId);

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

      const summaryResult = await summarize(text, {
        type: options?.type,
        format: "markdown",
        length: "medium"
      });

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

  useEffect(() => {
    if (typeof window !== "undefined" && chatState.chats.length > 0) {
      localStorage.setItem("chat-history", JSON.stringify(chatState.chats));
    }
  }, [chatState.chats]);

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

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
