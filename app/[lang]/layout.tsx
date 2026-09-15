import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { content, type Lang } from "@/lib/content";
import { LANGS, SITE_URL, isLang } from "@/lib/i18n";
import "../fonts.css";
import "../globals.css";

const meta: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Prompta aut perire — AI at work, properly taught",
    description:
      "Six parts, from knowing nothing to running your own agents. Lessons, comprehension checks, homework on your own real work and review by a live teacher. No coding, at your own pace. 500+ graduates.",
  },
  es: {
    title: "Prompta aut perire — IA en el trabajo, enseñada de verdad",
    description:
      "Seis partes, de no saber nada a manejar tus propios agentes. Lecciones, controles, tareas sobre tu trabajo real y corrección de una profesora. Sin programar, a tu ritmo. Más de 500 graduados.",
  },
  ru: {
    title: "Prompta aut perire — ИИ в работе, с настоящим обучением",
    description:
      "Шесть частей: с нуля до собственных ИИ-агентов. Уроки, проверка усвоения, задания на вашей настоящей работе и разбор живым преподавателем. Без программирования, в вашем темпе. Более 500 выпускников.",
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
