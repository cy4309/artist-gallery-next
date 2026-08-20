import { showSwal } from "@/utils/notification";
import { eventDetailPath } from "@/utils/eventId";

export function getEventShareUrl(eventId: string): string {
  const path = eventDetailPath(eventId);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 非 HTTPS／權限不足時改走 fallback
    }
  }

  try {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
}

export async function shareEvent(options: {
  title: string;
  url: string;
  copiedTitle?: string;
  copiedText?: string;
}): Promise<void> {
  const { title, url, copiedTitle, copiedText } = options;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text: title, url });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }

  const copied = await copyText(url);
  if (copied) {
    showSwal({
      isSuccess: true,
      title: copiedTitle ?? "已複製網址",
      text: copiedText ?? "活動連結已複製到剪貼簿",
    });
    return;
  }

  window.prompt("複製活動連結", url);
}
