export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  if (typeof window === "undefined") return;
  if (!window.gtag || !GA_ID) return;

  window.gtag("config", GA_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_ID) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
