import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { content, type Lang } from "@/lib/content";
import { LANGS, SITE_URL, isLang } from "@/lib/i18n";
import "../globals.css";

const meta: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Prompta aut perire — AI at work, properly taught",
    description:
      "A 2–4 week program that turns ChatGPT, Claude and Gemini into a system that runs your actual work. Lessons, comprehension checks, homework on your own tasks and personal review. 500+ graduates.",
  },
  es: {
    title: "Prompta aut perire — IA en el trabajo, enseñada de verdad",
    description:
      "Un programa de 2 a 4 semanas que convierte ChatGPT, Claude y Gemini en un sistema que sostiene tu trabajo real. Lecciones, controles, tareas sobre tus propios casos y corrección personal. Más de 500 graduados.",
  },
  ru: {
    title: "Prompta aut perire — ИИ в работе, с настоящим обучением",
    description:
      "Программа на 2–4 недели, которая превращает ChatGPT, Claude и Gemini в систему, ведущую вашу работу. Уроки, проверка усвоения, домашние задания на ваших задачах и личный разбор. Более 500 выпускников.",
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
      locale: lang,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#070b18",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
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
                courseWorkload: "P4W",
                name: content[lang].curriculum.title,
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
