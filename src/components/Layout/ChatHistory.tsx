import { usePathname } from "next/navigation";
import useChatStore from "../../../store";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "../ui/sidebar";
import { ScrollArea } from "../ui/scroll-area";
import { ChatHistoryItem } from "./ChatHistoryItem";

export const ChatHistory = () => {
  const { chats } = useChatStore();
  const pathname = usePathname();

  const chatHistory = chats.map((chat) => ({
    id: chat.id,
    title: chat.title || `Chat ${chats.length}`,
    url: `/chat/${chat.id}`,
    isActive: pathname === `/chat/${chat.id}`
  }));

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider">
        Chat History
      </SidebarGroupLabel>
      <SidebarGroupContent className="mt-2 flex-1">
        <ScrollArea className="h-[calc(100vh-500px)]">
          <SidebarMenu>
            {chatHistory.map((chat) => (
              <ChatHistoryItem key={chat.id} {...chat} />
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
