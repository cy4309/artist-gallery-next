import { useEffect, useState } from "react";
import liff from "@line/liff";

export function useLiff() {
  const [liffReady, setLiffReady] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function initLiff() {
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
          withLoginOnExternalBrowser: true,
        });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const userProfile = await liff.getProfile();
        setProfile(userProfile);
        setLiffReady(true);
      } catch (err) {
        console.error("LIFF 初始化錯誤:", err);
      }
    }

    initLiff();
  }, []);

  return { liffReady, profile };
}
