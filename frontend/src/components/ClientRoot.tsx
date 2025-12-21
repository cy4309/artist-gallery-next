"use client";

import { UserProvider } from "@/hooks/useUser";
import { LiffProvider } from "@/components/LiffProvider";
import { LocaleProvider } from "@/locales/contexts/LocaleContext";
// import Providers from "@/stores/Providers";
import LiffGate from "@/components/LiffGate";
import ClientOnly from "@/components/ClientOnly";

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
            <ClientOnly>{children}</ClientOnly>
          </UserProvider>
        </LiffGate>
      </LiffProvider>
    </LocaleProvider>
    // </Providers>
  );
}
