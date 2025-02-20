import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// Types
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

export interface Chat {
  id: string;
  messagePairs: MessagePair[];
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (chatId: string) => void;
  processingState: {
    isProcessing: boolean;
    isTranslating: boolean;
    isSummarizing: boolean;
    currentProcessingId: string | null;
  };
  translationService: {
    translate: (text: string, from: string, to: string) => Promise<string>;
    detectLanguage: (text: string) => Promise<{
      detectedLanguage: string;
      humanReadableName: string;
      confidence: number;
    } | null>;
    summarize: (text: string, options: any) => Promise<{ summary: string }>;
  } | null;
  setTranslationService: (service: ChatState["translationService"]) => void;
  setMessageProcessingState: (
    isProcessing: boolean,
    type?: "translating" | "summarizing",
    id?: string | null
  ) => void;
  createNewChat: () => string;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  translate: (responseId: string, targetLanguage: string) => Promise<void>;
  summarize: (
    responseId: string,
    options?: { type?: "key-points" | "tl;dr" | "teaser" | "headline" }
  ) => Promise<void>;
}

// Create store
const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      setCurrentChatId: (chatId: string) => {
        set({ currentChatId: chatId });
      },
      processingState: {
        isProcessing: false,
        isTranslating: false,
        isSummarizing: false,
        currentProcessingId: null
      },
      translationService: null,

      setTranslationService: (service) => {
        set({ translationService: service });
      },
      setMessageProcessingState: (
        isProcessing: boolean,
        type?: "translating" | "summarizing",
        id?: string | null
      ) => {
        set({
          processingState: {
            isProcessing,
            isTranslating: type === "translating" ? isProcessing : false,
            isSummarizing: type === "summarizing" ? isProcessing : false,
            currentProcessingId: isProcessing ? id || null : null
          }
        });
      },
      createNewChat: () => {
        const newChatId = uuidv4();
        set((state) => ({
          chats: [
            {
              id: newChatId,
              title: `Chat ${state.chats.length + 1}`,
              createdAt: Date.now(),
              messagePairs: []
            },
            ...state.chats
          ],
          currentChatId: newChatId
        }));
        return newChatId;
      },

      switchChat: (chatId: string) => {
        set({ currentChatId: chatId });
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== chatId);
          return {
            chats: newChats,
            currentChatId:
              state.currentChatId === chatId
                ? newChats[0]?.id || null
                : state.currentChatId
          };
        });
      },

      sendMessage: async (text: string) => {
        if (!text.trim() || !get().translationService) return;

        const state = get();
        state.setMessageProcessingState(true);

        // Create user message
        const userMessageId = uuidv4();
        const userMessage: UserMessage = {
          id: userMessageId,
          isUser: true,
          text
        };

        // Detect language
        const detectedResult = await state?.translationService?.detectLanguage(
          text
        );
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

        set((state) => {
          // Handle case when there's no current chat
          const chatIdToUse = state.currentChatId;
          if (!chatIdToUse) {
            const newChatId = uuidv4();
            return {
              ...state,
              chats: [
                {
                  id: newChatId,
                  messagePairs: [{ userMessage, response: responseMessage }]
                }
              ],
              currentChatId: newChatId
            };
          }

          const chatExists = state.chats.some(
            (chat) => chat.id === chatIdToUse
          );

          if (!chatExists) {
            // Add new chat with the current ID
            return {
              ...state,
              chats: [
                ...state.chats,
                {
                  id: chatIdToUse,
                  messagePairs: [{ userMessage, response: responseMessage }]
                }
              ]
            };
          }

          // Add to existing chat
          return {
            ...state,
            chats: state.chats.map((chat) =>
              chat.id === chatIdToUse
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

        get().setMessageProcessingState(false);
      },

      translate: async (responseId: string, targetLanguage: string) => {
        const state = get();
        if (!state.translationService) return;
        state.setMessageProcessingState(true, "translating", responseId);

        const currentChat = state.chats.find(
          (c) => c.id === state.currentChatId
        );
        if (!currentChat) {
          state.setMessageProcessingState(false);
          return;
        }

        const messagePairIndex = currentChat.messagePairs.findIndex(
          (pair) => pair.response.id === responseId
        );
        if (messagePairIndex === -1) {
          state.setMessageProcessingState(false);
          return;
        }

        const messagePair = currentChat.messagePairs[messagePairIndex];
        const sourceLanguage = messagePair.userMessage.detectedLanguage?.code;
        if (!sourceLanguage) {
          state.setMessageProcessingState(false);
          return;
        }

        // Perform translation
        const translatedText = await state.translationService.translate(
          messagePair.userMessage.text,
          sourceLanguage,
          targetLanguage
        );

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === state.currentChatId
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

        state.setMessageProcessingState(false);
      },

      summarize: async (
        responseId: string,
        options?: { type?: "key-points" | "tl;dr" | "teaser" | "headline" }
      ) => {
        const state = get();
        if (!state.translationService) return;
        state.setMessageProcessingState(true, "summarizing", responseId);

        const currentChat = state.chats.find(
          (c) => c.id === state.currentChatId
        );
        if (!currentChat) {
          state.setMessageProcessingState(false);
          return;
        }

        const messagePairIndex = currentChat.messagePairs.findIndex(
          (pair) => pair.response.id === responseId
        );
        if (messagePairIndex === -1) {
          state.setMessageProcessingState(false);
          return;
        }

        const messagePair = currentChat.messagePairs[messagePairIndex];
        const text = messagePair.userMessage.text;

        // Perform summarization
        const summaryResult = await state.translationService.summarize(text, {
          type: options?.type,
          format: "markdown",
          length: "medium"
        });

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === state.currentChatId
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

        state.setMessageProcessingState(false);
      }
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId
      }),
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useChatStore;
