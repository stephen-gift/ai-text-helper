"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NotFound() {
  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      toast.error("Page Not Found", {
        description: `Oops! ${pathname} does not exist. Redirecting...`
      });
    }, 100);

    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-r from-gray-900 to-gray-700 text-white">
      <h1 className="text-7xl font-bold">404</h1>
      <p className="mt-4 text-lg text-gray-300">
        Oops! The page{" "}
        <span className="font-semibold text-teal-400">{pathname}</span> doesn’t
        exist.
      </p>
      <p className="mt-2 text-sm text-gray-400">Redirecting you to Home...</p>
    </div>
  );
}
