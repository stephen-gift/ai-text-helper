"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, Save, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useUserStore } from "../../../store";
import { Label } from "../ui/label";

const avatarOptions = [
  "/images/Avatar1.jpg",
  "/images/Avatar2.svg",
  "/images/Avatar3.svg",
  "/images/Avatar4.jpg",
  "/images/Avatar5.svg",
  "/images/Avatar6.svg"
];

interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function NavUser({ user: initialUser }: NavUserProps) {
  const [open, setOpen] = useState(false);
  const { user, setUser, updateUser } = useUserStore();
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    avatar: initialUser.avatar
  });

  useEffect(() => {
    if (!user) {
      setUser(initialUser);
    }
  }, [initialUser, user, setUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setOpen(false);
  };

  const displayUser = user || initialUser;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem className="rounded">
          <SidebarMenuButton
            size="lg"
            onClick={() => setOpen(true)}
            className="w-full px-4 py-2 rounded  "
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
              <AvatarFallback className="rounded-lg">
                {displayUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayUser.name}</span>
              <span className="truncate text-xs text-gray-400">
                {displayUser.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update your profile information and avatar.
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4"></DialogClose>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ">Profile Picture</label>
                <div className="flex items-center justify-center">
                  <Avatar className="h-24 w-24 rounded-lg">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback className="rounded-lg text-xl ">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Avatar Selection Grid */}
                <div className="">
                  <label className="text-sm font-medium  block mb-2">
                    Choose Avatar
                  </label>
                  <div className="grid  justify-between items-center grid-flow-col auto-col-max gap-2 p-2 rounded-lg">
                    {avatarOptions.map((avatarSrc, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            avatar: avatarSrc
                          }))
                        }
                        className={`relative rounded-lg overflow-hidden hover:ring-2 hover:ring-slate-900 transition-all ${
                          formData.avatar === avatarSrc
                            ? "ring-2 ring-slate-900"
                            : ""
                        }`}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={avatarSrc}
                            alt={`Avatar option ${index + 1}`}
                          />
                          <AvatarFallback className="bg-gray-700">
                            <Camera className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-1 w-full">
                  <Label htmlFor="name" className="text-sm font-medium ">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className=" border-gray-700 "
                  />
                </div>

                <div className="space-y-1 w-full">
                  <Label htmlFor="email" className="text-sm font-medium ">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value
                      }))
                    }
                    className=" border-gray-700 "
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full  hover:bg-gray-700 text-white"
              >
                <Save className="mr-2 size-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
