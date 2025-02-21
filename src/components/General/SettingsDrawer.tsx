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
          <Settings className="h-5 w-5 text-gray-400" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b pb-2">
          <DrawerTitle>Summarization Settings</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <SummarizationSettings />
        </div>
        <div className="px-4 py-2 border-t flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
