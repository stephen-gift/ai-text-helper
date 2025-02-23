import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "../ui/sidebar";
import ChatSearch from "./ChatSearch";
import { ChatHistoryItem } from "./ChatHistoryItem";
import useChatStore from "../../../store";
import { usePathname } from "next/navigation";

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
      <SidebarGroupLabel>Chat History</SidebarGroupLabel>
      <SidebarGroupContent>
        <ChatSearch />
        <ScrollArea className="">
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
