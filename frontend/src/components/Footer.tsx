import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer className="mt-4 w-full flex justify-center items-center font-nunito text-center text-xs text-primaryGray dark:text-primaryGray/40">
        <p>© 2022 CYC Studio</p>
        <Link href="/privacy" className="cursor-pointer hover:opacity-70">
          | Privacy Policy
        </Link>
        <Link href="/terms" className="cursor-pointer hover:opacity-70">
          | Terms of Use
        </Link>
      </footer>
    </>
  );
};

export default Footer;
