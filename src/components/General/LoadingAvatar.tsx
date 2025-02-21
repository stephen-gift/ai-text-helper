"use client";

import React from "react";
import Image from "next/image";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  avatarSrc?: string;
}

export function LoadingAvatar({
  size = "md",
  avatarSrc = "/images/avatar-thinking-9.svg"
}: LoadingProps) {
  const sizes = {
    sm: {
      spinner: "h-20 w-20",
      border: "border-t-2 border-b-2",
      image: { width: 64, height: 64, className: "h-16 w-16" }
    },
    md: {
      spinner: "h-32 w-32",
      border: "border-t-4 border-b-4",
      image: { width: 112, height: 112, className: "h-28 w-28" }
    },
    lg: {
      spinner: "h-40 w-40",
      border: "border-t-5 border-b-5",
      image: { width: 144, height: 144, className: "h-36 w-36" }
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="relative flex justify-center items-center">
      <div
        className={`absolute animate-spin rounded-full ${currentSize.spinner} ${currentSize.border} border-purple-500`}
      ></div>
      <div
        className={`rounded-full overflow-hidden ${currentSize.image.className}`}
      >
        <Image
          src={avatarSrc}
          alt="Loading"
          width={currentSize.image.width}
          height={currentSize.image.height}
          priority
          className="rounded-full"
        />
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <LoadingAvatar />
      <p className="mt-6 text-gray-400 animate-pulse">Loading...</p>
    </div>
  );
}
