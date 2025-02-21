"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import Link from "next/link";
import Image from "next/image";
import useChatStore, { Chat, useUserStore } from "../../../store";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { SettingsDrawer } from "../General/SettingsDrawer";
import { Button } from "../ui/button";
import { MessageSquarePlus } from "lucide-react";

export interface ChatWithTitle extends Chat {
  title: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();
  const { createNewChat } = useChatStore();

  const data = {
    versions: ["1.0.1"],
    navMain: [
      {
        title: "Getting Started",
        url: "#",
        items: [
          {
            title: "Home",
            url: "/",
            isActive: pathname === "/"
          }
        ]
      }
    ],

    user: {
      name: user?.name || "Guest",
      email: user?.email || "Change@Your.Mail",
      avatar: user?.avatar || "/images/Avatar5.svg"
    }
  };
  const { chats } = useChatStore();

  const untitledCount: Record<string, number> = {};

  const chatHistory = chats.map((chat) => {
    let title = (chat as ChatWithTitle).title || "Untitled Chat";

    if (title === "Untitled Chat") {
      untitledCount[title] = (untitledCount[title] || 0) + 1;
      title = `Untitled Chat ${untitledCount[title]}`;
    }
    const url = `/chat/${chat.id}`;
    return {
      title,
      url,
      isActive: pathname === url
    };
  });

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      router.push(`/chat/${newChatId}`);
    }
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center gap-3 p-4 border-gray-700">
        <Image src="/images/Logo.svg" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold">Text Helper</span>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full gap-3 mt-2 ">
        {/* <div className="">
          <SearchForm />
        </div> */}

        <div className="px-2 flex justify-center w-full">
          <Button
            className="w-full  max-w-md py-2 md:py-3 text-base md:text-lg font-semibold flex items-center justify-center gap-2 group"
            onClick={handleNewChat}
          >
            <MessageSquarePlus className="w-5 h-5 transition-transform duration-300 " />
            New Chat
          </Button>
        </div>

        {/* Main Navigation */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title} className="">
            <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="hover:bg-gray-700 rounded"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className={`w-full px-4 py-2 rounded ${
                        item.isActive
                          ? "bg-gray-800 text-white font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider">
            Chat History
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2 flex-1 ">
            <ScrollArea className="h-[calc(100vh-500px)]">
              <SidebarMenu>
                {chatHistory.map((chat) => (
                  <SidebarMenuItem key={chat.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={chat.isActive}
                      className={`w-full px-4 py-2 rounded ${
                        chat.isActive
                          ? "bg-gray-800 text-white font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <Link href={chat.url}>{chat.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
      <SidebarFooter className="p-4 ">
        <SettingsDrawer />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
