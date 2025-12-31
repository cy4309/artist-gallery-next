"use client";

import { useState, ReactNode, useEffect } from "react";
import {
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  AlignLeftOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
// import Image from "next/image";
import { useTheme } from "next-themes";
import { useLocale } from "@/locales/contexts/LocaleContext";

interface NavItemProps {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  success?: boolean;
}

function NavItem({ label, icon, onClick, danger, success }: NavItemProps) {
  return (
    <BaseButton
      onClick={onClick}
      className={`
        w-full flex items-center justify-center
        px-3 py-2 rounded-xl
        bg-white/5 hover:bg-white/10
        text-sm hover:rotate-180
        text-white
        ${danger && "!text-primaryRed hover:!text-red-300"}
        ${success && "!text-green-400 hover:!text-green-300"}
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span className="ml-2">{label}</span>
    </BaseButton>
  );
}

export default function Nav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loadUser, loading } = useUser();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    if (!isOpen) return;
    // ① 防止背景 scroll
    document.body.style.overflow = "hidden";
    // ② ESC 關閉選單
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    // ③ cleanup（非常重要）
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !user) {
      loadUser();
    }
  }, [isOpen, user, loadUser]);

  /** 封裝導航跳轉 + 關閉 Drawer */
  const go = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  /** 🔥 登出 */
  const handleLogout = async () => {
    sessionStorage.setItem("justLoggedOut", "1"); // ⭐ 放 flag
    setIsOpen(false);
    logout(); // 清前端狀態

    await fetch("/api/auth/logout", { method: "POST" }); // 清server cookie

    router.push("/auth");
    router.refresh(); // ⭐ 強制同步 server 狀態(同步 server component)
  };

  /** 🔥 登入 */
  const handleLogin = async () => {
    setIsOpen(false);
    router.push("/auth");
  };

  /** 🌙 Dark Mode */
  const handleToggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsOpen(false);
  };

  /** toggle Locale */
  const handleLocale = () => {
    setLocale(locale === "zh" ? "en" : "zh");
    setIsOpen(false);
  };

  return (
    <nav className="mb-4 z-50 w-full flex justify-between items-center">
      <Link href="/">
        {/* <h1 className="text-2xl md:text-3xl font-dela">CYC ZINE</h1> */}
        <h1 className="text-2xl md:text-3xl font-dela">
          CYC <span className="tracking-[0.15em] -ml-1">ZINE</span>
        </h1>
      </Link>

      <div className="flex justify-end items-center fixed right-4">
        <BaseButton
          className="bg-white dark:bg-primary hover:rotate-180"
          onClick={() => setIsOpen(true)}
        >
          <AlignLeftOutlined />
        </BaseButton>
      </div>

      {/* Drawer / Side Menu */}
      <div
        className={`fixed z-50 top-0 right-0 w-full bg-gray-900/80 transition-all duration-500 overflow-hidden flex flex-col items-center text-white dark:text-primaryBlue ${
          isOpen ? "h-screen" : "h-0"
        }`}
      >
        <div className="p-4 w-full flex justify-between items-center">
          <h1
            className="text-2xl md:text-3xl cursor-pointer font-dela"
            onClick={() => {
              router.push("/");
              setIsOpen(false);
            }}
          >
            CYC <span className="tracking-[0.15em] -ml-1">ZINE</span>
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-2xl md:text-3xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <img
              src={user.picture}
              alt="picture"
              className="w-12 h-12 rounded-full border object-cover"
            />
          )}

          {user && (
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-xs opacity-70">{user.email}</span>
            </div>
          )}
        </div>

        <div className="p-4 w-2/3 md:w-1/3 flex flex-col gap-6 border-b border-white/20">
          <NavItem label={t.header.events} onClick={() => go("/events")} />
          {user && (
            <NavItem
              label={t.header.favorites}
              onClick={() => go("/favorites")}
            />
          )}
          <NavItem
            label={t.header.interviews}
            onClick={() => go("/interviews")}
          />
          <NavItem label={t.header.about} onClick={() => go("/about")} />
        </div>

        <div className="p-4 w-2/3 md:w-1/3 flex flex-col gap-4">
          <NavItem
            icon={<GlobalOutlined />}
            label={locale === "zh" ? t.header.switchToEn : t.header.switchToZh}
            onClick={handleLocale}
          />
          <NavItem
            label={
              theme === "dark" ? t.header.switchToLight : t.header.switchToDark
            }
            icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={handleToggleDarkMode}
          />
          {user ? (
            <NavItem
              label={t.header.logout}
              icon={<PoweroffOutlined />}
              onClick={handleLogout}
              danger
            />
          ) : (
            <NavItem
              label={t.header.login}
              icon={<PoweroffOutlined />}
              onClick={handleLogin}
              success
            />
          )}
        </div>
      </div>
    </nav>
  );
}
