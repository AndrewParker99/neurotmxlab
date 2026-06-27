"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_PASSWORD, SESSION_COOKIE, SESSION_VALUE } from "@/lib/session";

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (password !== APP_PASSWORD) {
    redirect("/?error=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
