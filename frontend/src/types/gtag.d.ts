export {};

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}
