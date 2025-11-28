"use client";

import { useState } from "react";
import { SunOutlined, AlignLeftOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import { useAppDispatch } from "@/utils/useRedux";
import { toggleDarkMode } from "@/stores/features/styleSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";

export default function Nav() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();

  /** 🔥 登出 */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/auth");
  };

  /** 🌙 Dark Mode */
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    const currentMode = localStorage.getItem("darkMode") === "true";
    localStorage.setItem("darkMode", (!currentMode).toString());
    setIsOpen(false);
  };

  return (
    <nav className="z-50 w-full flex justify-between items-center">
      <Link href="/" className="text-3xl font-dela">
        <h1>CYC STUDIO</h1>
      </Link>

      <div className="flex justify-end items-center fixed right-4">
        <BaseButton onClick={() => setIsOpen(true)}>
          <AlignLeftOutlined />
        </BaseButton>
      </div>

      {/* Drawer / Side Menu */}
      <div
        className={`fixed z-50 top-0 right-0 w-full bg-gray-900/80 transition-all duration-500 overflow-hidden flex flex-col items-center text-white gap-10 ${
          isOpen ? "h-screen" : "h-0"
        }`}
      >
        <div className="p-4 w-full flex justify-between items-center">
          <h1
            className="cursor-pointer text-3xl font-dela"
            onClick={() => {
              router.push("/dashboard");
              setIsOpen(false);
            }}
          >
            CYC STUDIO
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-3xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <ul className="p-4 w-full md:w-1/4 flex flex-col justify-center items-center gap-10">
          {/* Google Login / Profile */}
          <li className="w-full flex flex-col items-center gap-4">
            {loading ? (
              <div className="text-center text-gray-400">Checking...</div>
            ) : user ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src={user.picture}
                      alt="avatar"
                      className="rounded-full border object-cover"
                      fill
                    />
                  </div>
                  <p className="mt-2 font-bold">{user.name}</p>
                </div>

                <BaseButton
                  className="w-full bg-red-500 text-white"
                  onClick={handleLogout}
                  label="Logout"
                />
              </>
            ) : (
              <BaseButton
                className="w-full bg-blue-600 text-white"
                onClick={() => router.push("/auth")}
                label="Login with Google"
              />
            )}
          </li>

          {/* Dark Mode */}
          <li className="w-full">
            <BaseButton className="w-full" onClick={handleToggleDarkMode}>
              <SunOutlined />
            </BaseButton>
          </li>

          {/* Navigation Links */}
          <li className="w-full">
            <BaseButton
              label="Events"
              onClick={() => {
                router.push("/dashboard/events");
                setIsOpen(false);
              }}
              className="w-full"
            />
          </li>
          <li className="w-full">
            <BaseButton
              label="Special Columns"
              onClick={() => {
                router.push("/dashboard/interviews");
                setIsOpen(false);
              }}
              className="w-full"
            />
          </li>
          <li className="w-full">
            <BaseButton
              label="About Us"
              onClick={() => {
                router.push("/dashboard/about");
                setIsOpen(false);
              }}
              className="w-full"
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}
