import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
      <div className="p-4 w-full min-h-dvh flex flex-col">
        <Header />
        <main className="w-full flex flex-col grow justify-center items-center">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
