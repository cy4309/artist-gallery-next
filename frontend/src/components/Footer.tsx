"use client";

import Link from "next/link";
import { useLocale } from "@/locales/contexts/LocaleContext";

const Footer = () => {
  const { t } = useLocale();
  return (
    <>
      <footer className="z-50 w-full flex justify-center items-center font-nunito text-center text-xs text-primaryGray dark:text-primaryGray/40">
        <p>{t.footer.title}</p>
        <Link href="/privacy" className="ml-1 cursor-pointer hover:opacity-70">
          | {t.footer.privacy}
        </Link>
        <Link href="/terms" className="ml-1 cursor-pointer hover:opacity-70">
          | {t.footer.terms}
        </Link>
      </footer>
    </>
  );
};

export default Footer;
