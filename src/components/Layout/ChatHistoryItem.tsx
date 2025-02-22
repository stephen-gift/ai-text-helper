import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import useChatStore from "../../../store";
import { toast } from "sonner";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  isActive: boolean;
  url: string;
}

export const ChatHistoryItem = ({
  id,
  title,
  isActive,
  url
}: ChatHistoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const { deleteChat, updateChatTitle } = useChatStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      deleteChat(id);
      toast.success("Chat deleted successfully");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editedTitle.trim()) {
      toast.error("Chat title cannot be empty");
      return;
    }

    try {
      updateChatTitle(id, editedTitle);
      setIsEditing(false);
      toast.success("Chat title updated successfully");
    } catch {
      toast.error("Failed to update chat title");
    }
  };

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(title);
    setIsEditing(false);
  };

  return (
    <SidebarMenuItem>
      <div className="group relative flex items-center w-full">
        <SidebarMenuButton
          asChild={!isEditing}
          isActive={isActive}
          className={`flex-1 px-4 py-2 rounded ${
            isActive ? "bg-gray-800 text-white font-semibold" : "text-gray-400"
          }`}
        >
          {isEditing ? (
            <div className="flex items-center h-full">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className={`w-full bg-transparent border-none focus:outline-none ${
                  isActive ? "text-black font-semibold" : "text-gray-400"
                }`}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave(e);
                  } else if (e.key === "Escape") {
                    handleCancel(e);
                  }
                }}
              />
            </div>
          ) : (
            <Link href={url}>
              <span>{title}</span>
            </Link>
          )}
        </SidebarMenuButton>
        <div
          className={`absolute right-2 flex items-center space-x-1 ${
            isActive || isEditing ? "visible" : "invisible group-hover:visible"
          }`}
        >
          {isEditing ? (
            <>
              <Button
                variant={"outline"}
                onClick={handleSave}
                className="p-1 hover:text-green-500 text-gray-400 rounded-lg w-7 h-7"
              >
                <Check size={30} />
              </Button>
              <Button
                variant={"outline"}
                onClick={handleCancel}
                className="p-1 hover:text-red-500 text-gray-400 rounded-lg w-7 h-7"
              >
                <X size={30} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={"outline"}
                onClick={handleEdit}
                className="p-1 hover:text-blue-500 text-gray-400 rounded-lg w-7 h-7"
              >
                <Pencil size={30} />
              </Button>
              <Button
                variant={"outline"}
                onClick={handleDelete}
                className="p-1 hover:text-red-500 text-gray-400 rounded-lg w-7 h-7"
              >
                <Trash2 size={30} />
              </Button>
            </>
          )}
        </div>
      </div>
    </SidebarMenuItem>
  );
};
