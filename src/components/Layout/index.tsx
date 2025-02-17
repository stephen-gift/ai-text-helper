import React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Separator } from "../ui/separator";
import Breadcrumbs from "./Breadcrumbs";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="h-screen flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Image
              src="/images/Logo.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
            />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </header>
          <div className="flex overflow-hidden flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Layout;
