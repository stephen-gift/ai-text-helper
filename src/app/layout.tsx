import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./provider";

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
    "apple-mobile-web-app-title": "TextHelper"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
            <Layout>
              {children}
              <Toaster richColors />
            </Layout>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
