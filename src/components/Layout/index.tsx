"use client";
import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Separator } from "../ui/separator";
import Breadcrumbs from "./Breadcrumbs";
import Image from "next/image";
import { useTranslation } from "@/contexts/TranslationContext";
import NotSupportedComponent from "../Error/NotSupported";
import { useUserStore } from "../../../store";
import { UserOnboardingModal } from "../Onboarding/UserOnboardingModal";
import { LoadingAvatar } from "../General/LoadingAvatar";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const {
    isTranslationSupported,
    isDetectionSupported,
    isSummarizationSupported
  } = useTranslation();
  const router = useRouter();

  const { user } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const isAnyApiUnsupported =
    !isTranslationSupported ||
    !isDetectionSupported ||
    !isSummarizationSupported;

  if (!isHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <LoadingAvatar size="md" avatarSrc="/images/Logo.svg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-gray-900">
        <UserOnboardingModal />
      </div>
    );
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 justify-between items-center gap-2 border-b px-4">
            <div className="flex h-16 shrink-0 items-center gap-2 ">
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
            </div>
            <Button
              variant={"outline"}
              className="rounded-full w-10 h-10"
              onClick={() => router.push("/not-supported")}
            >
              <HelpCircle />
            </Button>
          </header>
          <div className="flex flex-1 max-h-[calc(100svh-70px)]  flex-col overflow-hidden p-4 ">
            {isAnyApiUnsupported ? (
              <NotSupportedComponent
                isTranslationSupported={isTranslationSupported}
                isDetectionSupported={isDetectionSupported}
                isSummarizationSupported={isSummarizationSupported}
              />
            ) : (
              children
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default Layout;
