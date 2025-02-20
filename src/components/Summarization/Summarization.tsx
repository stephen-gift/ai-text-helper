// src/components/Summarization.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSummarization } from "@/hooks/useSummarization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Check } from "lucide-react";

interface SummarizationProps {
  initialText?: string;
  maxLength?: number;
  className?: string;
}

export function Summarization({
  initialText = "",
  maxLength = 4000,
  className = ""
}: SummarizationProps) {
  const [inputText, setInputText] = useState(initialText);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { isReady, capabilities, options, updateOptions, summarize } =
    useSummarization({
      type: "extractive",
      format: "paragraph",
      length: "medium"
    });

  // Auto-summarize when text changes (with debounce)
  const [debouncedText, setDebouncedText] = useState(inputText);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(inputText);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [inputText]);

  useEffect(() => {
    if (isReady && debouncedText.trim().length > 0) {
      handleSummarize();
    }
  }, [debouncedText, isReady, options]);

  const handleSummarize = async () => {
    if (!inputText.trim() || !isReady) return;

    setIsSummarizing(true);
    setError(null);

    try {
      const result = await summarize(inputText);

      if (result.successful) {
        setSummary(result.summary);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setError(result.error || "An unknown error occurred");
        setSummary("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize text");
      setSummary("");
    } finally {
      setIsSummarizing(false);
    }
  };

  const characterCount = inputText.length;
  const isExceedingLimit = characterCount > maxLength;

  if (!capabilities.isSupported) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Supported</AlertTitle>
        <AlertDescription>
          {capabilities.errorMessage ||
            "AI Summarization is not supported in your browser."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>AI Summarization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="input-text" className="text-sm font-medium">
                Text to Summarize
              </label>
              <span
                className={`text-xs ${
                  isExceedingLimit ? "text-red-500" : "text-gray-500"
                }`}
              >
                {characterCount} / {maxLength} characters
                {isExceedingLimit && " (may be too long to summarize)"}
              </span>
            </div>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to summarize..."
              className="h-32 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={options.type || "extractive"}
                onValueChange={(value) =>
                  updateOptions({ type: value as "extractive" | "abstractive" })
                }
                disabled={isSummarizing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extractive">Extractive</SelectItem>
                  <SelectItem value="abstractive">Abstractive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Format</label>
              <Select
                value={options.format || "paragraph"}
                onValueChange={(value) =>
                  updateOptions({ format: value as "paragraph" | "bullet" })
                }
                disabled={isSummarizing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="bullet">Bullet Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Length</label>
              <Select
                value={options.length || "medium"}
                onValueChange={(value) =>
                  updateOptions({
                    length: value as "short" | "medium" | "long"
                  })
                }
                disabled={isSummarizing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert
              variant="default"
              className="bg-green-50 text-green-800 border-green-200"
            >
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Summary generated successfully
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <div className="p-4 bg-muted rounded-md min-h-24">
              {isSummarizing ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Generating summary...
                  </span>
                </div>
              ) : (
                <div>{summary || "Your summary will appear here"}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">Powered by AI Summarization</div>
        <Button
          onClick={handleSummarize}
          disabled={!inputText.trim() || isSummarizing || !isReady}
        >
          {isSummarizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
