import { redirect } from "next/navigation";

export default function Home() {
  // 一律導向 dashboard（middleware 會在那邊決定是否要擋）
  redirect("/dashboard");
}
