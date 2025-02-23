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
import { useMediaQuery } from "react-responsive";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathnames = pathname.split("/").filter((x) => x);
  const { chats } = useChatStore();
  const isMobile = useMediaQuery({ maxWidth: 450 });

  // Don't render breadcrumbs on mobile
  if (isMobile) return null;

  const getBreadcrumbLabel = (segment: string, index: number) => {
    if (segment === "chat") {
      return "Chat";
    }
    if (pathnames[0] === "chat" && index === 1) {
      const chatId = segment;
      const chat = chats.find((c) => c.id === chatId);
      const title = chat?.title || "Untitled Chat";
      return title;
    }
    return segment;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };
  console.log(truncateText);

  const shouldShowHome = !pathname.startsWith("/chat");

  return (
    <Breadcrumb className="max-w-full overflow-hidden">
      <BreadcrumbList className="flex-wrap">
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
              <BreadcrumbItem className="max-w-[200px] truncate">
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
