import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { content, type Lang } from "@/lib/content";
import { LANGS, SITE_URL, isLang } from "@/lib/i18n";
import "../fonts.css";
import "../globals.css";

/* Kept under 160 characters: past that a search result truncates and the
   sentence that was meant to sell the page ends in an ellipsis. */
const meta: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Prompta aut perire — AI at work, properly taught",
    description:
      "Six parts, from knowing nothing to running your own agents. Homework on your own real work, reviewed by a live teacher. No coding, at your own pace.",
  },
  de: {
    title: "Prompta aut perire — KI im Job, richtig unterrichtet",
    description:
      "Sechs Teile, von null bis zu eigenen Agenten. Aufgaben an Ihrer echten Arbeit, korrigiert von einer echten Dozentin. Ohne Programmieren, in Ihrem Tempo.",
  },
  es: {
    title: "Prompta aut perire — IA en el trabajo, enseñada de verdad",
    description:
      "Seis partes, de no saber nada a manejar tus propios agentes. Tareas sobre tu trabajo real, corregidas por una profesora. Sin programar, a tu ritmo.",
  },
  ru: {
    title: "Prompta aut perire — ИИ в работе, с настоящим обучением",
    description:
      "Шесть частей: с нуля до собственных ИИ-агентов. Задания на вашей настоящей работе и разбор живым преподавателем. Без программирования, в вашем темпе.",
  },
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const m = meta[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [l, `/${l}`])),
        "x-default": "/en",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${lang}`,
      siteName: "Prompta aut perire",
      locale: lang,
      type: "website",
      images: [
        {
          url: `/og-${lang}.png`,
          width: 1200,
          height: 630,
          alt: m.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [`/og-${lang}.png`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#06070b",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "Prompta aut perire",
              description: meta[lang].description,
              inLanguage: lang,
              provider: {
                "@type": "Organization",
                name: "Prompta aut perire",
                url: SITE_URL,
              },
              offers: {
                "@type": "Offer",
                price: "150",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/${lang}`,
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                name: content[lang].curriculum.title,
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
