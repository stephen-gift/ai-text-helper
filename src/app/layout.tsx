import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { TranslationProvider } from "@/contexts/TranslationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "AI-Powered Text Processing Interface",
  description:
    "An AI-powered tool for text summarization, translation, and language detection using Chrome's AI APIs.",
  other: {
    "origin-trial": process.env.NEXT_PUBLIC_ORIGIN_TRIAL || "",
    "origin-trial-2": process.env.NEXT_PUBLIC_ORIGIN_TRIAL_2 || "",
    "origin-trial-3": process.env.NEXT_PUBLIC_ORIGIN_TRIAL_3 || ""
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="origin-trial"
          content="ApywZEcawPu3bp6OLLTdoGZKtPjN5sKcNOYQ7FrAJbcOp/vfx7SNIZu8Zxj9gqcIPXzkGd5/KiS1HpvUvKee5gwAAABVeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiQUlTdW1tYXJpemF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ=="
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Layout>
          <TranslationProvider>
            {children}
            <Toaster />
          </TranslationProvider>
        </Layout>
      </body>
    </html>
  );
}
