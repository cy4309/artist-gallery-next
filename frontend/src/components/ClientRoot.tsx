"use client";

import { Suspense } from "react";
import { UserProvider } from "@/hooks/useUser";
import { LiffProvider } from "@/components/LiffProvider";
import { LocaleProvider } from "@/locales/contexts/LocaleContext";
// import Providers from "@/stores/Providers";
import LiffGate from "@/components/LiffGate";
import ClientOnly from "@/components/ClientOnly";
import AnalyticsListener from "@/components/AnalyticsListener";
import ImageProtection from "@/components/ImageProtection";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <Providers>
    <LocaleProvider>
      <LiffProvider>
        <LiffGate>
          <UserProvider>
            {/* ⭐ GA 專用，獨立，關鍵修正要加Suspense */}
            <Suspense fallback={null}>
              <AnalyticsListener />
            </Suspense>
            <ImageProtection />
            {/* ⭐ UI 真正 client-only */}
            <ClientOnly>{children}</ClientOnly>
          </UserProvider>
        </LiffGate>
      </LiffProvider>
    </LocaleProvider>
    // </Providers>
  );
}
