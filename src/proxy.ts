import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "abas_session";
const SESSION_VALUE = "granted-9f3a1c7e";

export default function proxy(req: NextRequest) {
  const isAuthed = req.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isAuthed && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isAuthed && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
