"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb";
import useChatStore from "../../../store";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathnames = pathname.split("/").filter((x) => x);
  const { chats } = useChatStore();

  const getBreadcrumbLabel = (segment: string, index: number) => {
    if (segment === "chat") {
      return "Chat";
    }
    if (pathnames[0] === "chat" && index === 1) {
      const chatId = segment;
      const chat = chats.find((c) => c.id === chatId);
      return chat?.title || "Untitled Chat";
    }
    return segment;
  };

  const shouldShowHome = !pathname.startsWith("/chat");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {shouldShowHome && (
          <BreadcrumbItem>
            {pathname === "/" ? (
              <BreadcrumbPage>Home</BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
              >
                Home
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        )}
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = getBreadcrumbLabel(name, index);
          const isDynamicChatId = pathnames[0] === "chat" && index === 1;

          return (
            <React.Fragment key={routeTo}>
              {(shouldShowHome || index > 0) && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || isDynamicChatId ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={routeTo}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(routeTo);
                    }}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
