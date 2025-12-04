"use client";

import { useState } from "react";
import { SunOutlined, AlignLeftOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
// import BaseButtonNormal from "@/components/BaseButtonNormal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Nav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const { theme, setTheme } = useTheme();

  /** 🔥 登出 */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
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

        <ul className="p-4 w-full md:w-1/4 flex flex-col justify-center items-center gap-8">
          {/* Google Login / Profile */}
          <li className="w-full flex flex-col items-center gap-4">
            {loading ? (
              <div className="text-center text-gray-400">Checking...</div>
            ) : (
              user && (
                <>
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                      <Image
                        src={user.picture}
                        alt="avatar"
                        className="rounded-full border object-cover"
                        fill
                        sizes="48px"
                      />
                    </div>
                    <p className="mt-2 font-bold">{user.name}</p>
                  </div>

                  <BaseButton
                    label="Logout"
                    onClick={handleLogout}
                    className="w-full hover:rotate-180"
                  ></BaseButton>
                </>
              )
            )}
          </li>

          {/* Dark Mode */}
          <li className="w-full">
            <BaseButton
              className="w-full hover:rotate-180"
              onClick={handleToggleDarkMode}
            >
              <SunOutlined />
            </BaseButton>
          </li>

          {/* Navigation Links */}
          <li className="w-full">
            <BaseButton
              label="Events"
              onClick={() => {
                router.push("/events");
                setIsOpen(false);
              }}
              className="w-full hover:rotate-180"
            />
          </li>
          <li className="w-full">
            <BaseButton
              label="Special Columns"
              onClick={() => {
                router.push("/interviews");
                setIsOpen(false);
              }}
              className="w-full hover:rotate-180"
            />
          </li>
          <li className="w-full">
            <BaseButton
              label="About Us"
              onClick={() => {
                router.push("/about");
                setIsOpen(false);
              }}
              className="w-full hover:rotate-180"
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}
