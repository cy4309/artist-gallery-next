"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  AlignLeftOutlined,
  PoweroffOutlined,
  CloseOutlined,
} from "@ant-design/icons";
// import BaseButton from "@/components/BaseButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "next-themes";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { useDrawer } from "@/hooks/useDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { requestEventsNavReset } from "@/utils/eventsBrowseState";

interface NavItemProps {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  success?: boolean;
}

function NavItem({
  label,
  icon,
  onClick,
  active,
  danger,
  success,
}: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ rotate: active ? 180 : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`
        w-full flex items-center justify-center
        px-3 py-2 rounded-xl
        bg-white/5 hover:bg-white/10
        text-sm text-white
        border-cyc
        ${danger && "!text-primaryRed hover:!text-red-300"}
        ${success && "!text-green-400 hover:!text-green-300"}
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span className="ml-2">{label}</span>
    </motion.button>
  );
}

export default function Nav() {
  const drawer = useDrawer();
  const router = useRouter();
  const { user, logout, loadUser, loading } = useUser();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  /** ⭐ 用來控制哪個 item 正在被點擊（旋轉） */
  const [clickedKey, setClickedKey] = useState<string | null>(null);

  useEffect(() => {
    if (drawer.isOpen && !user && !loading) {
      loadUser();
    }
  }, [drawer.isOpen, user, loading, loadUser]);

  function runWithFeedback(key: string, action: () => void, delay = 250) {
    setClickedKey(key);

    setTimeout(() => {
      action();
      setClickedKey(null);
    }, delay);
  }

  /** 封裝導航跳轉 + 關閉 Drawer */
  const go = (path: string, key: string) => {
    runWithFeedback(key, () => {
      router.push(path);
      drawer.close();
    });
  };

  /** 登出 */
  const handleLogout = () => {
    runWithFeedback("logout", async () => {
      sessionStorage.setItem("justLoggedOut", "1"); // ⭐ 放 flag
      drawer.close();
      logout(); // 清前端狀態

      await fetch("/api/auth/logout", { method: "POST" });

      router.push("/auth");
      router.refresh(); // ⭐ 強制同步 server 狀態(同步 server component)
    });
  };

  /** 登入 */
  const handleLogin = () => {
    runWithFeedback("login", () => {
      router.push("/auth");
      drawer.close();
    });
  };

  /** Dark mode */
  const handleToggleDarkMode = () => {
    runWithFeedback("theme", () => {
      setTheme(theme === "dark" ? "light" : "dark");
      drawer.close();
    });
  };

  /** Locale */
  const handleLocale = () => {
    runWithFeedback("locale", () => {
      setLocale(locale === "zh" ? "en" : "zh");
      drawer.close();
    });
  };

  return (
    <nav className="z-50 w-full flex justify-between items-center">
      <Link href="/">
        <h1 className="text-2xl md:text-3xl font-dela">
          CYC <span className="tracking-[0.15em] -ml-1">ZINE</span>
        </h1>
      </Link>

      {/* 🔥 Drawer Trigger（點擊才旋轉） */}
      <div className="fixed right-4">
        <motion.button
          onClick={drawer.open}
          animate={{ rotate: drawer.isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex justify-center items-center border-cyc bg-white dark:bg-primary"
        >
          <AlignLeftOutlined />
        </motion.button>
      </div>

      {/* 🔥 Drawer */}
      <AnimatePresence>
        {drawer.isOpen && (
          <motion.div
            key="nav-drawer"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="
              fixed inset-0 z-50
              bg-gray-900/80
              backdrop-blur-md
              flex flex-col items-center
              text-white dark:text-primaryBlue
            "
          >
            {/* Header */}
            <div className="p-4 w-full flex justify-between items-center">
              <h1
                className="text-2xl md:text-3xl cursor-pointer font-dela"
                onClick={() => go("/", "home")}
              >
                CYC <span className="tracking-[0.15em] -ml-1">ZINE</span>
              </h1>

              <motion.button
                onClick={drawer.close}
                animate={{ rotate: drawer.isOpen ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex justify-center items-center border-cyc dark:text-white dark:bg-gray-900/80"
              >
                <CloseOutlined />
              </motion.button>
            </div>

            {/* User */}
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <img
                    src={user.picture}
                    alt="picture"
                    className="w-12 h-12 rounded-full border object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs opacity-70">{user.email}</span>
                  </div>
                </>
              )}
            </div>

            {/* Nav */}
            <div className="p-4 mt-4 w-2/3 md:w-1/3 flex flex-col gap-6 border-b border-white/20">
              <NavItem
                label={t.header.events}
                active={clickedKey === "events"}
                onClick={() => {
                  requestEventsNavReset();
                  go("/events", "events");
                }}
              />
              {user && (
                <NavItem
                  label={t.header.favorites}
                  active={clickedKey === "favorites"}
                  onClick={() => go("/favorites", "favorites")}
                />
              )}
              <NavItem
                label={t.header.interviews}
                active={clickedKey === "interviews"}
                onClick={() => go("/interviews", "interviews")}
              />
              <NavItem
                label={t.header.about}
                active={clickedKey === "about"}
                onClick={() => go("/about", "about")}
              />
            </div>

            {/* Actions */}
            <div className="p-4 w-2/3 md:w-1/3 flex flex-col gap-4">
              <NavItem
                icon={<GlobalOutlined />}
                label={
                  locale === "zh" ? t.header.switchToEn : t.header.switchToZh
                }
                active={clickedKey === "locale"}
                onClick={handleLocale}
              />
              <NavItem
                icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
                label={
                  theme === "dark"
                    ? t.header.switchToLight
                    : t.header.switchToDark
                }
                active={clickedKey === "theme"}
                onClick={handleToggleDarkMode}
              />
              {user ? (
                <NavItem
                  label={t.header.logout}
                  icon={<PoweroffOutlined />}
                  active={clickedKey === "logout"}
                  onClick={handleLogout}
                  danger
                />
              ) : (
                <NavItem
                  label={t.header.login}
                  icon={<PoweroffOutlined />}
                  active={clickedKey === "login"}
                  onClick={handleLogin}
                  success
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
