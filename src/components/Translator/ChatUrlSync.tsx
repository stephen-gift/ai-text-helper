import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useChatStore from "../../../store";

const ChatUrlSync = () => {
  const router = useRouter();
  const params = useParams();
  const { currentChatId, setCurrentChatId, chats, createNewChat } =
    useChatStore();

  const chatId = params?.chatId as string;

  const syncUrlToStore = useCallback(() => {
    if (!chatId) {
      if (chats.length > 0) {
        router.replace(`/chat/${chats[0].id}`);
      } else {
        const newChatId = createNewChat();
        router.replace(`/chat/${newChatId}`);
      }
      return;
    }

    const chatExists = chats.some((chat) => chat.id === chatId);

    if (!chatExists) {
      if (chats.length > 0) {
        router.replace(`/chat/${chats[0].id}`);
      } else {
        const newChatId = createNewChat();
        router.replace(`/chat/${newChatId}`);
      }
      return;
    }

    if (currentChatId !== chatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, chats, currentChatId, setCurrentChatId, createNewChat, router]);

  useEffect(() => {
    syncUrlToStore();
  }, [syncUrlToStore]);

  useEffect(() => {
    if (currentChatId && currentChatId !== chatId) {
      router.replace(`/chat/${currentChatId}`);
    }
  }, [currentChatId, chatId, router]);

  return null;
};

export default ChatUrlSync;
