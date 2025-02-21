import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

export interface Chat {
  id: string;
  messagePairs: MessagePair[];
}

interface SummarizationPreferences {
  defaultType: "key-points" | "tl;dr" | "teaser" | "headline";
  defaultLength: "short" | "medium" | "long";
  defaultFormat: "markdown" | "plain";
  customPrompt?: string;
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
  summarizationPreferences: SummarizationPreferences;
  updateSummarizationPreferences: (
    prefs: Partial<SummarizationPreferences>
  ) => void;
}

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
      summarizationPreferences: {
        defaultType: "key-points",
        defaultLength: "medium",
        defaultFormat: "markdown"
      },
      translationService: null,
      updateSummarizationPreferences: (
        prefs: Partial<SummarizationPreferences>
      ) => {
        set((state) => ({
          summarizationPreferences: {
            ...state.summarizationPreferences,
            ...prefs
          }
        }));
      },
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

        const userMessageId = uuidv4();
        const userMessage: UserMessage = {
          id: userMessageId,
          isUser: true,
          text
        };

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
        options?: {
          type?: "key-points" | "tl;dr" | "teaser" | "headline";
          length?: "short" | "medium" | "long";
          format?: "markdown" | "plain";
        }
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

        const { summarizationPreferences } = state;

        const summaryResult = await state.translationService.summarize(text, {
          type: options?.type || summarizationPreferences.defaultType,
          format: options?.format || summarizationPreferences.defaultFormat,
          length: options?.length || summarizationPreferences.defaultLength,
          customPrompt: summarizationPreferences.customPrompt
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
        currentChatId: state.currentChatId,
        summarizationPreferences: state.summarizationPreferences
      }),
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useChatStore;

interface UserState {
  user: {
    name: string;
    email: string;
    avatar: string;
  } | null;

  setUser: (user: UserState["user"]) => void;
  updateUser: (updates: Partial<NonNullable<UserState["user"]>>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),

      logout: () => set({ user: null })
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
      storage: createJSONStorage(() => localStorage)
    }
  )
);
