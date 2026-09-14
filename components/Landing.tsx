"use client";

import { useState } from "react";
import { content, type Lang } from "@/lib/content";
import { LANGS, LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_LABEL } from "@/lib/i18n";
import LeadForm from "./LeadForm";

const ICO: Record<string, string> = {
  done: "ico--done",
  now: "ico--now",
  next: "ico--next",
};

const MARK: Record<string, string> = {
  done: "✓",
  now: "▶",
  next: "3",
};

export default function Landing({ lang }: { lang: Lang }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tab, setTab] = useState(0);
  const c = content[lang];
  const example = c.demo.tabs[tab];

  // Remember the choice so "/" sends this visitor straight here next time.
  function remember(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${LANG_COOKIE_MAX_AGE};samesite=lax`;
  }

  return (
    <>
      <header className="hdr">
        <div className="shell hdr-in">
          <a className="logo" href="#top">
            Prompta <i>aut perire</i>
          </a>

          <nav className="mainnav" aria-label="Sections">
            <a href="#method">{c.nav.method}</a>
            <a href="#curriculum">{c.nav.curriculum}</a>
            <a href="#platform">{c.nav.platform}</a>
            <a href="#pricing">{c.nav.pricing}</a>
          </nav>

          <div className="hdr-right">
            <nav className="lang" aria-label="Language">
              {LANGS.map((code) => (
                <a
                  key={code}
                  href={`/${code}`}
                  hrefLang={code}
                  lang={code}
                  onClick={() => remember(code)}
                  aria-current={lang === code ? "true" : undefined}
                  title={content[code].label}
                >
                  {LANG_LABEL[code]}
                </a>
              ))}
            </nav>
            <a className="btn btn--primary" href="#pricing">
              {c.nav.cta}
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------------- hero ---------------- */}
        <section className="hero">
          <div className="shell hero-in">
            <div>
              <span className="pill">
                <i aria-hidden="true" />
                {c.hero.pill}
              </span>

              <h1>
                {c.hero.title[0]}
                <br />
                {c.hero.title[1]}
                <span className="grad">{c.hero.title[2]}</span>
                {c.hero.title[3]}
              </h1>

              <p className="lede">{c.hero.sub}</p>

              <div className="hero-cta">
                <a className="btn btn--primary" href="#pricing">
                  {c.hero.cta} — {c.hero.now}
                </a>
                <a className="btn btn--ghost" href="#method">
                  {c.hero.ghost}
                </a>
                <span className="price-inline">
                  <s>{c.hero.was}</s>
                </span>
              </div>

              <div className="hero-tags">
                {c.hero.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="mock" aria-hidden="true">
              <div className="mock-top">
                <span>{c.hero.app.heading}</span>
                <span>{c.hero.app.week}</span>
              </div>
              <div className="mock-bar">
                <i />
              </div>
              {c.hero.app.rows.map((r) => (
                <div className="mock-row" key={r.title}>
                  <span className={`ico ${ICO[r.state]}`}>{MARK[r.state]}</span>
                  <p>
                    {r.title}
                    <span>{r.meta}</span>
                  </p>
                  <span className="t">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- pain ---------------- */}
        <section className="section section--tight">
          <div className="shell">
            <p className="eyebrow">{c.pain.eyebrow}</p>
            <h2 className="h2">{c.pain.title}</h2>

            <div className="pain-grid">
              {c.pain.items.map((it) => (
                <div className="pain-cell" key={it.q}>
                  <q>{it.q}</q>
                  <p>{it.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- mechanism ---------------- */}
        <section className="section mech">
          <div className="shell">
            <p className="eyebrow">{c.mechanism.eyebrow}</p>
            <h2 className="h2">{c.mechanism.title}</h2>
            <p className="lede">{c.mechanism.lede}</p>

            <div className="pillars">
              {c.mechanism.pillars.map((p, i) => (
                <article className="pillar" key={p.n}>
                  <span className="pillar-n">{p.n}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  {i < c.mechanism.pillars.length - 1 && (
                    <span className="pillar-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </article>
              ))}
            </div>

            <p className="mech-close">{c.mechanism.close}</p>
          </div>
        </section>

        {/* ---------------- demo ---------------- */}
        <section className="section demo">
          <div className="shell">
            <p className="eyebrow">{c.demo.eyebrow}</p>
            <h2 className="h2">{c.demo.title}</h2>
            <p className="lede">{c.demo.lede}</p>

            <div className="tabs" role="tablist" aria-label={c.demo.title}>
              {c.demo.tabs.map((t, i) => (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  className="tab"
                  aria-selected={i === tab}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTab(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              className="compare"
              id={`panel-${example.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${example.id}`}
            >
              <article className="cmp cmp--bad">
                <h3 className="cmp-label">{c.demo.badLabel}</h3>
                <pre className="cmp-prompt">{example.bad.prompt}</pre>
                <p className="cmp-res-label">{c.demo.resultLabel}</p>
                <p className="cmp-res">{example.bad.result}</p>
              </article>

              <article className="cmp cmp--good">
                <h3 className="cmp-label">{c.demo.goodLabel}</h3>
                <pre className="cmp-prompt">{example.good.prompt.join("\n")}</pre>
                <p className="cmp-res-label">{c.demo.resultLabel}</p>
                <p className="cmp-res">{example.good.result}</p>
              </article>
            </div>

            <p className="method-note">{c.demo.note}</p>
          </div>
        </section>

        {/* ---------------- method ---------------- */}
        <section className="section method" id="method">
          <div className="shell">
            <p className="eyebrow">{c.method.eyebrow}</p>
            <h2 className="h2">{c.method.title}</h2>
            <p className="lede">{c.method.lede}</p>

            <div className="steps">
              {c.method.steps.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>

            <p className="method-note">{c.method.note}</p>
          </div>
        </section>

        {/* ---------------- platform ---------------- */}
        <section className="section" id="platform">
          <div className="shell plat-in">
            <div>
              <p className="eyebrow">{c.platform.eyebrow}</p>
              <h2 className="h2">{c.platform.title}</h2>
              <p className="lede">{c.platform.sub}</p>

              <ul className="plat-list">
                {c.platform.bullets.map((b) => (
                  <li key={b}>
                    <span className="tick" aria-hidden="true">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="plat-shot">
              <div className="shot-head">
                <span className="shot-dot" />
                <span className="shot-dot" />
                <span className="shot-dot" />
                <span style={{ marginLeft: 6 }}>learn.prompta</span>
              </div>
              <div className="shot-body">
                Platform screenshot goes here
                <br />
                (replace with a real capture)
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- curriculum ---------------- */}
        <section className="section" id="curriculum">
          <div className="shell">
            <p className="eyebrow">{c.curriculum.eyebrow}</p>
            <h2 className="h2">{c.curriculum.title}</h2>
            <p className="lede">{c.curriculum.sub}</p>

            <div className="mods">
              {c.curriculum.modules.map((m) => (
                <article className="mod" key={m.n}>
                  <span className="mod-n">{m.n}</span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <div className="mod-res">
                    <span aria-hidden="true">→</span>
                    <span>{m.result}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- audience ---------------- */}
        <section className="section section--tight">
          <div className="shell">
            <p className="eyebrow">{c.audience.eyebrow}</p>
            <h2 className="h2">{c.audience.title}</h2>
            <p className="lede">{c.audience.sub}</p>

            <div className="aud">
              {c.audience.cards.map((a) => (
                <article className="aud-card" key={a.title}>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- outcomes ---------------- */}
        <section className="section">
          <div className="shell out-in">
            <div>
              <p className="eyebrow">{c.outcomes.eyebrow}</p>
              <h2 className="h2">{c.outcomes.title}</h2>

              <ul className="out-list">
                {c.outcomes.items.map((o, i) => (
                  <li key={o}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stats">
              {c.outcomes.stats.map((s) => (
                <div className="stat" key={s.l}>
                  <b>{s.v}</b>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- testimonials ----------------
            Renders only once real, attributed quotes exist. */}
        {c.testimonials.items.length > 0 && (
          <section className="section section--tight">
            <div className="shell">
              <p className="eyebrow">{c.testimonials.eyebrow}</p>
              <h2 className="h2">{c.testimonials.title}</h2>

              <div className="quotes">
                {c.testimonials.items.map((t) => (
                  <figure className="quote" key={t.name}>
                    <p className="quote-result">{t.result}</p>
                    <blockquote>{t.quote}</blockquote>
                    <figcaption>
                      <b>{t.name}</b>
                      <span>{t.role}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- cost of waiting ---------------- */}
        <section className="section section--tight">
          <div className="shell">
            <div className="costbox">
              <p className="eyebrow">{c.cost.eyebrow}</p>
              <h2 className="h2">{c.cost.title}</h2>
              <p className="cost-text">{c.cost.text}</p>
              <a className="btn btn--primary" href="#pricing">
                {c.cost.cta} — {c.pricing.now}
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- faq ---------------- */}
        <section className="section section--tight">
          <div className="shell">
            <p className="eyebrow">{c.faq.eyebrow}</p>
            <h2 className="h2">{c.faq.title}</h2>

            <div className="faq-list">
              {c.faq.items.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div className="faq-item" key={f.q} data-open={open}>
                    <h3>
                      <button
                        type="button"
                        className="faq-q"
                        id={`faq-q-${i}`}
                        aria-expanded={open}
                        aria-controls={`faq-a-${i}`}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        {f.q}
                      </button>
                    </h3>
                    <p
                      className="faq-a"
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      hidden={!open}
                    >
                      {f.a}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- pricing + form ---------------- */}
        <section className="section buy" id="pricing">
          <div className="shell">
            <p className="eyebrow">{c.pricing.eyebrow}</p>
            <h2 className="h2">{c.pricing.title}</h2>
            <p className="lede">{c.pricing.sub}</p>

            <div className="buy-in">
              <div className="card card--offer">
                <div className="price-block">
                  <span className="price-now">{c.pricing.now}</span>
                  <span className="price-was">{c.pricing.was}</span>
                  <span className="price-save">−50%</span>
                </div>

                <ul className="incl">
                  {c.pricing.includes.map((i) => (
                    <li key={i}>
                      <span className="tick" aria-hidden="true">
                        ✓
                      </span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <div className="form-head">
                  <h3 className="h3">{c.form.title}</h3>
                  <p>{c.form.sub}</p>
                </div>
                <LeadForm copy={c.form} lang={lang} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ftr">
        <div className="shell ftr-in">
          <span className="ftr-tag">{c.footer.tagline}</span>
          <span>
            © {new Date().getFullYear()} Prompta aut perire. {c.footer.rights}
          </span>
        </div>
      </footer>
    </>
  );
}
