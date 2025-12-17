"use client";

import LoadingIndicator from "@/components/LoadingIndicator";

export default function Loading() {
  return (
    <div className="w-full min-h-[100dvh] flex justify-center items-center">
      <LoadingIndicator />
    </div>
  );
}
