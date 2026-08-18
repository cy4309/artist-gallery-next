"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiff } from "@/components/LiffProvider";
import { useUser } from "@/hooks/useUser";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function EntryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const to = params.get("to") || "events";

  const { ready } = useLiff();
  const { user, loadUser } = useUser();

  useEffect(() => {
    if (!ready) return;

    async function boot() {
      // 確保 user 狀態
      if (!user) {
        await loadUser();
      }

      // 導向目標頁
      router.replace(`/${to}`);
    }

    boot();
  }, [ready]);

  return <LoadingIndicator />;
}
