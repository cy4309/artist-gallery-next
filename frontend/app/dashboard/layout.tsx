// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import type { Metadata } from "next";
// import {
//   Dela_Gothic_One,
//   Nunito,
//   Noto_Sans_TC,
//   Caveat_Brush,
// } from "next/font/google";
// // import "./globals.css";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import Providers from "@/stores/Providers";

// const delaGothic = Dela_Gothic_One({
//   subsets: ["latin"],
//   weight: "400",
//   variable: "--font-dela-gothic",
// });

// const nunito = Nunito({
//   subsets: ["latin"],
//   variable: "--font-nunito",
// });

// const noto = Noto_Sans_TC({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
//   variable: "--font-noto",
// });

// const caveat = Caveat_Brush({
//   subsets: ["latin"],
//   weight: "400",
//   variable: "--font-caveat",
// });

// export const metadata: Metadata = {
//   title: "CYC Studio",
//   description: "Discover Activities & Events",
// };

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const router = useRouter();
//   const [isChecking, setIsChecking] = useState(true);

//   useEffect(() => {
//     const user = localStorage.getItem("fc_user");

//     if (!user) {
//       router.replace("/auth");
//     } else {
//       setIsChecking(false); // 允許顯示內容
//     }
//   }, [router]);

//   if (isChecking) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }
//   return (
//     <html lang="zh-Hant" suppressHydrationWarning>
//       <body
//         className={`${nunito.variable} ${noto.variable} ${delaGothic.variable} ${caveat.variable} antialiased`}
//       >
//         <Providers>
//           <div className="p-4 w-full min-h-dvh flex flex-col justify-center items-center text-primary bg-white dark:bg-primary dark:text-white">
//             <Header />
//             <main className="w-full grow justify-center items-center">
//               {children}
//             </main>
//             <Footer />
//           </div>
//         </Providers>
//       </body>
//     </html>
//   );
// }

// import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// export const metadata: Metadata = {
//   title: "CYC Studio",
//   description: "Discover Activities & Events",
// };

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("cyc_session");
  if (!session) redirect("/auth");

  return (
    <>
      {/* <div className="p-4 w-full min-h-dvh flex flex-col justify-center items-center text-primary bg-white dark:bg-primary dark:text-white"> */}
      <div className="p-4 w-full min-h-dvh flex flex-col">
        <Header />
        <main className="w-full flex flex-col grow justify-center items-center">
          {children}
        </main>
        <Footer />
      </div>
      {/* </div> */}
    </>
  );
}
