import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import useChatStore from "../../../store";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MessageMatch {
  userMessage: string;
  response: string;
}

interface ChatMatch {
  id: string;
  title: string;
  matches: {
    title: boolean;
    messages: MessageMatch[];
  };
}

const ChatSearch = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { chats } = useChatStore();
  const pathname = usePathname();
  const [filteredChats, setFilteredChats] = useState<ChatMatch[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats([]);
      return;
    }

    const filtered = chats
      .map((chat) => {
        const titleMatch = chat.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const messageMatches = (chat.messagePairs || []).filter(
          (pair) =>
            pair.userMessage.text
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            pair.response.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (titleMatch || messageMatches.length > 0) {
          return {
            id: chat.id,
            title: chat.title,
            matches: {
              title: titleMatch,
              messages: messageMatches.map((pair) => ({
                userMessage: pair.userMessage.text,
                response: pair.response.text
              }))
            }
          };
        }
        return null;
      })
      .filter((item): item is ChatMatch => item !== null);

    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  const handleResultClick = () => {
    setIsModalOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Search Input Trigger */}
      <div className="relative w-full px-4 py-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Search chats..."
            onClick={() => setIsModalOpen(true)}
            readOnly
            className="pl-10 w-full bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          />
        </div>
      </div>

      {/* Search Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 bg-white dark:bg-gray-900">
          <DialogTitle className="sr-only">Search Chats</DialogTitle>
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Search in chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 w-full bg-white dark:bg-gray-900 dark:text-gray-100"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery && (
              <>
                {filteredChats.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No matches found
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Try different keywords
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredChats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        onClick={() => handleResultClick()}
                        className={`block p-4 rounded-lg border ${
                          pathname === `/chat/${chat.id}`
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700"
                        }`}
                      >
                        <h4 className="font-medium dark:text-gray-100">
                          {chat.matches.title ? (
                            <span className="bg-yellow-100 dark:bg-yellow-900/20">
                              {chat.title}
                            </span>
                          ) : (
                            chat.title
                          )}
                        </h4>

                        {chat.matches.messages.length > 0 && (
                          <div className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            {chat.matches.messages.map((match, idx) => (
                              <div
                                key={idx}
                                className="pl-4 border-l-2 border-gray-200 dark:border-gray-600"
                              >
                                <div className="line-clamp-2">
                                  {match.userMessage.length >
                                  match.response.length
                                    ? match.userMessage
                                    : match.response}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSearch;
