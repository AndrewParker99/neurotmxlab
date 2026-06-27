"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const APP_PASSWORD = "Romanovich88_";
const SESSION_COOKIE = "abas_session";
const SESSION_VALUE = "granted-9f3a1c7e";

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (password !== APP_PASSWORD) {
    redirect("/login?error=1");
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
  redirect("/login");
}
