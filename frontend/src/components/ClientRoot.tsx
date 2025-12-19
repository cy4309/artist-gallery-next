"use client";

import { UserProvider } from "@/hooks/useUser";
// import Providers from "@/stores/Providers";
import { LiffProvider } from "@/components/LiffProvider";
import LiffGate from "@/components/LiffGate";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <Providers>
    <LiffProvider>
      <LiffGate>
        <UserProvider>{children}</UserProvider>
      </LiffGate>
    </LiffProvider>
    // </Providers>
  );
}
