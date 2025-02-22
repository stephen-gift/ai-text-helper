"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../../../store";
import { sendEmailsWithNotification } from "@/service/WelcomeEmailService";
import { toast } from "sonner";

const avatarOptions = [
  "/images/Avatar1.jpg",
  "/images/Avatar2.svg",
  "/images/Avatar3.svg",
  "/images/Avatar4.jpg",
  "/images/Avatar5.svg",
  "/images/Avatar6.svg"
];

export function UserOnboardingModal() {
  const { user, setUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: avatarOptions[0]
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isNameValid = formData.name.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    setIsValid(isNameValid && isEmailValid);
  }, [formData]);

  useEffect(() => {
    if (!user) {
      setOpen(true);
    }
  }, [user]);

  const handleOpenChange = (newOpen: boolean) => {
    if (user || newOpen) {
      setOpen(newOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isValid) {
      setLoading(true);
      try {
        setUser(formData);

        const { name, email } = formData;
        await sendEmailsWithNotification({ name, email });

        toast.success("Welcome email sent successfully!");

        setOpen(false);
      } catch (error) {
        console.error("Error during onboarding:", error);

        toast.error("Failed to send welcome email. Please try again.");

        setUser(formData);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800"
        onPointerDownOutside={(e) => !user && e.preventDefault()}
        onEscapeKeyDown={(e) => !user && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome! Tell us about yourself</DialogTitle>
        </DialogHeader>

        <p className="text-gray-300 text-sm">
          Please provide your details before using the application. You can
          always update these later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Choose Your Avatar
              </label>
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24 rounded-lg">
                  <AvatarImage
                    src={formData.avatar}
                    alt={formData.name || "Your avatar"}
                  />
                  <AvatarFallback className="rounded-lg text-xl bg-gray-800">
                    {formData.name
                      ? formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Avatar Selection Grid */}
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-800 rounded-lg">
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
                      className={`relative rounded-lg overflow-hidden hover:ring-2 hover:ring-white/50 transition-all ${
                        formData.avatar === avatarSrc ? "ring-2 ring-white" : ""
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

            <div className="space-y-2">
              <label
                htmlFor="onboarding-name"
                className="text-sm font-medium text-gray-200"
              >
                Your Name*
              </label>
              <Input
                id="onboarding-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="onboarding-email"
                className="text-sm font-medium text-gray-200"
              >
                Email*
              </label>
              <Input
                id="onboarding-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!isValid || loading}
          >
            {loading ? "Setting up your account..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
