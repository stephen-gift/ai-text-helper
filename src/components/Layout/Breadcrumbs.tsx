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

const Breadcrumbs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathnames = pathname.split("/").filter((x) => x);

  const getBreadcrumbLabel = (segment: string, index: number) => {
    if (segment === "chat") {
      return "Chat";
    }
    if (pathnames[0] === "chat" && index === 1) {
      return "Chat ID";
    }
    return segment;
  };

  const shouldShowHome = !pathname.startsWith("/chat");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Only show "Home" if not in chat route */}
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
        {/* Render other breadcrumbs */}
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = getBreadcrumbLabel(name, index);

          const isDynamicChatId = pathnames[0] === "chat" && index === 1;

          return (
            <React.Fragment key={routeTo}>
              {/* Only show separator if Home is visible or not the first item */}
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
