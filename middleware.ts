import { NextResponse, type NextRequest } from "next/server";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  isLang,
  langFromAcceptHeader,
} from "@/lib/i18n";

/**
 * "/" carries no content of its own — it forwards to the visitor's language:
 * their remembered choice first, otherwise what their browser asks for.
 * Every language keeps its own address so search engines can index all three.
 */
export function middleware(request: NextRequest) {
  const remembered = request.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(remembered)
    ? remembered
    : langFromAcceptHeader(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${lang}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LANG_COOKIE, lang, {
    maxAge: LANG_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
  return response;
}

export const config = {
  matcher: "/",
};
