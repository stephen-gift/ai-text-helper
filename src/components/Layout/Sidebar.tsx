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
import { SearchForm } from "./SearchForm";
import { NavUser } from "./NavUser";
import Link from "next/link";
import Image from "next/image";
import useChatStore, { Chat } from "../../../store";
import { usePathname } from "next/navigation";

export interface ChatWithTitle extends Chat {
  title: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // This is sample data.
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
      name: "shadcn",
      email: "m@example.com",
      avatar: "/images/Logo.svg"
    }
  };
  const { chats } = useChatStore(); // Assuming your store has a `chats` state
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
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex items-center gap-3 p-4 border-gray-700">
        <Image src="/images/Logo.svg" alt="Logo" width={40} height={40} />
        <span className="text-lg font-bold">Your App</span>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4">
          <SearchForm />
        </div>

        {/* Main Navigation */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title} className="mt-4">
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

        {/* Chat History */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider">
            Chat History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.map((chat) => (
                <SidebarMenuItem
                  key={chat.title}
                  className="hover:bg-gray-700 rounded"
                >
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarRail />
      <SidebarFooter className="p-4 ">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
