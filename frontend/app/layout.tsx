import type { Metadata } from "next";
import {
  Dela_Gothic_One,
  Nunito,
  // Noto_Sans_TC,
  Caveat_Brush,
} from "next/font/google";
import "./globals.css";
// import Providers from "@/stores/Providers";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserProvider } from "@/hooks/useUser";

const delaGothic = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

// const noto = Noto_Sans_TC({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
//   variable: "--font-noto",
// });

const caveat = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "CYC Studio",
  description: "Discover Activities & Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${delaGothic.variable} ${caveat.variable} antialiased text-primary bg-white dark:bg-primary dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <UserProvider>
            {/* <Providers> */}
            <div className="p-4 w-full min-h-dvh flex flex-col justify-center items-center">
              <Header />
              <main className="w-full flex flex-col grow justify-center items-center">
                {children}
              </main>
              <Footer />
            </div>
            {/* </Providers> */}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
