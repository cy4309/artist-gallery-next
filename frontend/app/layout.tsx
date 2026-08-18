import type { Metadata, Viewport } from "next";
import {
  Dela_Gothic_One,
  Nunito,
  // Noto_Sans_TC,
  Caveat_Brush,
} from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientRoot from "@/components/ClientRoot"; // layout是ssr，裡面要接component需包一層client才可以
import Script from "next/script";
import {
  DEFAULT_OG_IMAGE,
  getSiteBaseUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/utils/siteMetadata";

const siteUrl = getSiteBaseUrl();

const delaGothic = Dela_Gothic_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dela-gothic",
});

// export const delaGothic = localFont({
//   src: "/fonts/DelaGothicOne-Regular.ttf",
//   weight: "400",
//   variable: "--font-dela-gothic",
//   display: "swap",
// });

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
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        {/* GA */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body
        className={`${nunito.variable} ${delaGothic.variable} ${caveat.variable} antialiased text-primary bg-white dark:bg-primary dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // ⭐ 預設 dark
          enableSystem={false} // ⭐ 不跟系統走
          // defaultTheme="system"
          // enableSystem={true}
        >
          <ClientRoot>
            <div className="p-4 w-full h-dvh flex flex-col items-center gap-3">
              <Header />
              <main className="w-full flex flex-col grow min-h-0 overflow-y-auto">
                {children}
              </main>
              <Footer />
            </div>
          </ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
