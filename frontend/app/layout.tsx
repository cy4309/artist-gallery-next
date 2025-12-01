import type { Metadata } from "next";
import {
  Dela_Gothic_One,
  Nunito,
  // Noto_Sans_TC,
  Caveat_Brush,
} from "next/font/google";
import "./globals.css";
import Providers from "@/stores/Providers";

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
        <Providers>
          <div className="w-full min-h-dvh flex flex-col justify-center items-center">
            <main className="w-full h-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
