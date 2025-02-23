import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import SummarizationSettings from "./SummarizationSettings";

export function SettingsDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white dark:bg-gray-900">
        <DrawerHeader className="border-b dark:border-gray-700 pb-2">
          <DrawerTitle className="text-gray-900 dark:text-gray-100">
            Summarization Settings
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <SummarizationSettings />
        </div>
        <div className="px-4 py-2 border-t dark:border-gray-700 flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="dark:bg-gray-800">
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
