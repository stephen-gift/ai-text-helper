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
          <Label
            htmlFor="summary-type"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
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
            <SelectTrigger
              id="summary-type"
              className="w-full bg-white dark:bg-gray-800"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem
                value="key-points"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Key Points
              </SelectItem>
              <SelectItem
                value="tl;dr"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                TL;DR
              </SelectItem>
              <SelectItem
                value="teaser"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Teaser
              </SelectItem>
              <SelectItem
                value="headline"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Headline
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="summary-length"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
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
            <SelectTrigger
              id="summary-length"
              className="w-full bg-white dark:bg-gray-800"
            >
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem
                value="short"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Short
              </SelectItem>
              <SelectItem
                value="medium"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Medium
              </SelectItem>
              <SelectItem
                value="long"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Long
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Format and Custom Instructions */}
      <div className="space-y-1">
        <Label
          htmlFor="summary-format"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
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
          <SelectTrigger
            id="summary-format"
            className="w-full bg-white dark:bg-gray-800"
          >
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            <SelectItem
              value="markdown"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Markdown
            </SelectItem>
            <SelectItem
              value="plain-text"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Plain Text
            </SelectItem>
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
          className="dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SummarizationSettings;
