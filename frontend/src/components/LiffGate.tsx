import { useLiff } from "@/components/LiffProvider";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function LiffGate({ children }: { children: React.ReactNode }) {
  const { ready, error, isInClient } = useLiff();

  // 🌐 一般瀏覽器：直接放行
  if (!isInClient) {
    return <>{children}</>;
  }

  // 📱 LINE WebView：等 LIFF
  if (!ready) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div>LIFF init failed</div>;
  }

  return <>{children}</>;
}
