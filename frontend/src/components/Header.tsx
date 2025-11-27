"use client";

// import cycLogo from "/cyc-logo.png";
import { useEffect, useState } from "react";
import { SunOutlined, AlignLeftOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import { useAppDispatch } from "@/utils/useRedux";
import { toggleDarkMode } from "@/stores/features/styleSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import Login from "@/containers/Login";
// import { showSwal } from "@/utils/notification";

const Nav = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  // const isAuthenticated = localStorage.getItem("userName");

  const handleCloseModal = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleCloseModal);
    return () => {
      window.removeEventListener("keydown", handleCloseModal);
    };
  }, []);

  // const handleAuth = () => {
  //   if (isAuthenticated) {
  //     // dispatch(logout());
  //     showSwal(true, "You have been logged out.");
  //     setIsLoginOpen(false);
  //     localStorage.removeItem("userName");
  //     navigate("/");
  //   } else {
  //     setIsLoginOpen(true);
  //   }
  // };

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
      {/* <h1
        className="cursor-pointer text-3xl font-dela"
        onClick={() => Link("/")}
      >
        CYC STUDIO
      </h1> */}
      <div className="flex justify-end items-center fixed right-4">
        <BaseButton onClick={() => setIsOpen(true)}>
          <AlignLeftOutlined />
        </BaseButton>
      </div>

      <div
        className={`fixed z-50 top-0 right-0 w-full bg-gray-900/80 transition-all duration-500 overflow-hidden flex flex-col items-center text-white gap-10 ${
          isOpen ? "h-screen" : "h-0"
        }`}
      >
        <div className="p-4 w-full flex justify-between items-center">
          <h1
            className="cursor-pointer text-3xl font-dela"
            onClick={() => {
              router.push("/");
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
          <li className="w-full">
            <BaseButton
              className="w-full"
              // onClick={() => dispatch(toggleDarkMode())}
              onClick={handleToggleDarkMode}
            >
              <SunOutlined />
            </BaseButton>
          </li>
          {/* <BaseButton
            label={isAuthenticated ? "Log Out" : "Log In"}
            onClick={handleAuth}
            // className={`text-white bg-primaryGray hover:bg-black dark:bg-white dark:text-primaryGray`}
            className={`${
              isAuthenticated
                ? "hover:bg-hoverGray dark:bg-primaryGray dark:text-white hover:dark:bg-hoverGray"
                : "bg-primaryGray text-white hover:bg-hoverGray dark:bg-white dark:text-primaryGray hover:dark:bg-hoverGray"
            }`}
          /> */}
          <li className="w-full">
            <BaseButton
              label="Events"
              onClick={() => {
                router.push("/events");
                setIsOpen(false);
              }}
              className="w-full"
            ></BaseButton>
          </li>
          <li className="w-full">
            <BaseButton
              label="Special Columns"
              onClick={() => {
                router.push("/interviews");
                setIsOpen(false);
              }}
              className="w-full"
            ></BaseButton>
          </li>
          <li className="w-full">
            <BaseButton
              label="About Us"
              onClick={() => {
                router.push("/about");
                setIsOpen(false);
              }}
              className="w-full"
            ></BaseButton>
          </li>
        </ul>
      </div>

      {/* <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} /> */}
    </nav>
  );
};

export default Nav;
