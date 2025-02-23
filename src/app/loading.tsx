import { LoadingAvatar } from "@/components/General/LoadingAvatar";

export default function Loading() {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <LoadingAvatar avatarSrc="/images/Logo.svg" />
    </div>
  );
}
