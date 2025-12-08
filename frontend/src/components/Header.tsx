"use client";

import { useState, ReactNode } from "react";
import {
  SunOutlined,
  AlignLeftOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
// import BaseButtonNormal from "@/components/BaseButtonNormal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
// import Image from "next/image";
import { useTheme } from "next-themes";

interface NavItemProps {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

function NavItem({ label, icon, onClick, danger }: NavItemProps) {
  return (
    <BaseButton
      onClick={onClick}
      className={`
        w-full flex items-center justify-center
        px-3 py-2 rounded-xl
        bg-white/5 hover:bg-white/10
        text-sm hover:rotate-180
        ${danger ? "text-red-400 hover:text-red-300" : "text-white"}
      `}
    >
      <span>{label}</span>
      {icon && <span className="text-base">{icon}</span>}
    </BaseButton>
  );
}

export default function Nav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useUser();
  const { theme, setTheme } = useTheme();

  /** 封裝導航跳轉 + 關閉 Drawer */
  const go = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  /** 🔥 登出 */
  const handleLogout = async () => {
    logout(); // ← ⭐ 清掉前端 user 狀態
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  };

  /** 🌙 Dark Mode */
  const handleToggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsOpen(false);
  };

  return (
    <nav className="z-50 w-full flex justify-between items-center">
      <Link href="/" className="text-2xl md:text-3xl font-dela">
        <h1>CYC STUDIO</h1>
      </Link>

      <div className="flex justify-end items-center fixed right-4">
        <BaseButton
          onClick={() => setIsOpen(true)}
          className="hover:rotate-180"
        >
          <AlignLeftOutlined />
        </BaseButton>
      </div>

      {/* Drawer / Side Menu */}
      <div
        className={`fixed z-50 top-0 right-0 w-full bg-gray-900/80 transition-all duration-500 overflow-hidden flex flex-col items-center text-white ${
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
            CYC STUDIO
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
          <NavItem label="Events" onClick={() => go("/events")} />
          {user && (
            <NavItem label="Favorites" onClick={() => go("/favorites")} />
          )}
          <NavItem label="Special Columns" onClick={() => go("/interviews")} />
          <NavItem label="About Us" onClick={() => go("/about")} />
        </div>

        <div className="p-4 w-2/3 md:w-1/3 flex flex-col gap-4">
          <NavItem
            // label="Dark Mode"
            icon={<SunOutlined />}
            onClick={handleToggleDarkMode}
          />
          {user && (
            <NavItem
              // label="Logout"
              icon={<PoweroffOutlined />}
              onClick={handleLogout}
              danger
            />
          )}
        </div>
      </div>
    </nav>
  );
}
