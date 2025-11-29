import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("cyc_session");
  if (!session) redirect("/auth");

  redirect("/dashboard");
}
