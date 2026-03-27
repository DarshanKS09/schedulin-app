import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getSessionFromCookies } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/dashboard");
  }

  return <AuthForm mode="register" />;
}
