import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import { isLang } from "@/lib/i18n";

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return <Landing lang={lang} />;
}
