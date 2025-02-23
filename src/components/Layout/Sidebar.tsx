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
import { SettingsDrawer } from "../General/SettingsDrawer";
import { Button } from "../ui/button";
import { MessageSquarePlus } from "lucide-react";
import { ChatHistory } from "./ChatHistory";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";

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

  const handleNewChat = () => {
    const newChatId = createNewChat();
    if (newChatId) {
      toast.success("New chat created!", {
        description: "Starting fresh conversation..."
      });
      router.push(`/chat/${newChatId}`);
    } else {
      toast.error("Failed to create new chat", {
        description: "Please try again"
      });
    }
  };

  return (
    <Sidebar
      {...props}
      className="bg-[url('/images/sidebar-texture-light.jpg')] dark:bg-[url('/images/sidebar-texture-dark.jpg')] bg-cover bg-no-repeat"
    >
      <SidebarHeader className="flex flex-row items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <Image src="/images/Logo.svg" alt="Logo" width={30} height={30} />
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Text Helper
        </span>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full gap-3 mt-2">
        <div className="px-2 flex justify-center w-full">
          <Button
            onClick={handleNewChat}
            className="w-full max-w-md py-2.5 md:py-3 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 
        text-blue-600 dark:text-blue-300 text-base md:text-lg font-semibold 
        flex items-center justify-center gap-3 group 
        border border-blue-100 dark:border-blue-900
        transition-all duration-300"
          >
            <MessageSquarePlus className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            New Chat
          </Button>
        </div>

        {/* Main Navigation */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title} className="">
            <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider dark:text-gray-500">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className={`w-full px-4 py-2 rounded ${
                        item.isActive
                          ? "bg-blue-500 text-white font-semibold dark:bg-blue-600"
                          : "text-gray-700 dark:text-gray-300"
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

        <ChatHistory />
      </SidebarContent>

      <SidebarRail />
      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
        <SettingsDrawer />
        <div className="flex items-center gap-2">
          <ModeToggle /> {/* Add the ModeToggle component here */}
          <NavUser user={data.user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
