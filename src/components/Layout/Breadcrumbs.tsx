"use client"; // Mark this as a Client Component
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

  // Map dynamic segments to readable labels
  const getBreadcrumbLabel = (segment: string) => {
    if (segment === "chat") {
      return "Chat";
    }
    return segment;
  };

  // Skip rendering "Home" if we're in the chat route
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
          const label = getBreadcrumbLabel(name);

          return (
            <React.Fragment key={routeTo}>
              {/* Only show separator if Home is visible or not the first item */}
              {(shouldShowHome || index > 0) && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
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
