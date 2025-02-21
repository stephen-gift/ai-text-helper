import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useChatStore from "../../../store";

const SummarizationSettings = () => {
  const { summarizationPreferences, updateSummarizationPreferences } =
    useChatStore();

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto py-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Type and Length in one row */}
        <div className="space-y-1">
          <Label htmlFor="summary-type" className="text-sm">
            Summary Type
          </Label>
          <Select
            value={summarizationPreferences.defaultType}
            onValueChange={(value) =>
              updateSummarizationPreferences({
                defaultType: value as
                  | "key-points"
                  | "tl;dr"
                  | "teaser"
                  | "headline"
              })
            }
          >
            <SelectTrigger id="summary-type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="key-points">Key Points</SelectItem>
              <SelectItem value="tl;dr">TL;DR</SelectItem>
              <SelectItem value="teaser">Teaser</SelectItem>
              <SelectItem value="headline">Headline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="summary-length" className="text-sm">
            Length
          </Label>
          <Select
            value={summarizationPreferences.defaultLength}
            onValueChange={(value) =>
              updateSummarizationPreferences({
                defaultLength: value as "short" | "medium" | "long"
              })
            }
          >
            <SelectTrigger id="summary-length" className="w-full">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Format and Custom Instructions */}
      <div className="space-y-1">
        <Label htmlFor="summary-format" className="text-sm">
          Format
        </Label>
        <Select
          value={summarizationPreferences.defaultFormat}
          onValueChange={(value) =>
            updateSummarizationPreferences({
              defaultFormat: value as "markdown" | "plain"
            })
          }
        >
          <SelectTrigger id="summary-format" className="w-full">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="plain-text">Plain Text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateSummarizationPreferences({
              defaultType: "key-points",
              defaultLength: "medium",
              defaultFormat: "markdown",
              customPrompt: undefined
            })
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SummarizationSettings;
