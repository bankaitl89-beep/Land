"use client";

import { useState } from "react";
import { content, type Lang } from "@/lib/content";
import { LANGS, LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_LABEL } from "@/lib/i18n";
import AssemblyScene from "./AssemblyScene";
import Cursor from "./Cursor";
import ModuleIcon from "./ModuleIcon";
import PlatformMock from "./PlatformMock";
import FieldCanvas from "./FieldCanvas";
import { useDepthEffects, useTypewriter } from "./useDepthEffects";
import LeadForm from "./LeadForm";

function Mark() {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M8 2H2v22h6" stroke="#5B67F5" strokeWidth="2.2" />
      <path d="M18 2h6v22h-6" stroke="#5B67F5" strokeWidth="2.2" />
      <rect x="11.5" y="6" width="3" height="14" fill="#F1F2F5" />
    </svg>
  );
}

export default function Landing({
  lang: initialLang,
  preview = false,
}: {
  lang: Lang;
  /** Design preview: one standalone file, so the switch changes language
      in place instead of navigating to a sibling page. */
  preview?: boolean;
}) {
  const [previewLang, setPreviewLang] = useState<Lang>(initialLang);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tab, setTab] = useState(0);
  const lang = preview ? previewLang : initialLang;
  const c = content[lang];
  const example = c.demo.tabs[tab];

  useDepthEffects(lang);
  useTypewriter("hero-ask", "hero-out", c.demo.tabs[0].good.prompt);

  // Remember the choice so "/" sends this visitor straight here next time.
  function remember(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${LANG_COOKIE_MAX_AGE};samesite=lax`;
  }

  return (
    <>
      <FieldCanvas />
      <Cursor />
      <div id="glow" aria-hidden="true" />
      <div id="progress" aria-hidden="true" />

      <header className="hdr">
        <div className="shell hdr-in">
          <a className="logo" href="#top">
            <Mark />
            Prompta
          </a>

          <nav className="mainnav" aria-label="Sections">
            <a href="#method">{c.nav.method}</a>
            <a href="#curriculum">{c.nav.curriculum}</a>
            <a href="#skills">{c.nav.skills}</a>
            <a href="#pricing">{c.nav.pricing}</a>
          </nav>

          <div className="hdr-right">
            <nav className="lang" aria-label="Language">
              {LANGS.map((code) =>
                preview ? (
                  <button
                    key={code}
                    type="button"
                    lang={code}
                    onClick={() => setPreviewLang(code)}
                    aria-current={lang === code ? "true" : undefined}
                    title={content[code].label}
                  >
                    {LANG_LABEL[code]}
                  </button>
                ) : (
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
                ),
              )}
            </nav>
            <a className="btn btn--acc" href="#pricing">
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
              <span className="pill rv">
                <i aria-hidden="true" />
                {c.hero.pill}
              </span>

              <h1 className="rv">
                {c.hero.title[0]}
                <br />
                {c.hero.title[1]}
                <span className="grad">{c.hero.title[2]}</span>
                {c.hero.title[3]}
              </h1>

              <p className="lede rv">{c.hero.sub}</p>

              <div className="hero-cta rv">
                <a className="btn btn--acc" href="#pricing">
                  {c.hero.cta} — {c.hero.now}
                </a>
                <a className="btn btn--ghost" href="#method">
                  {c.hero.ghost}
                </a>
              </div>

              <p className="hero-meta rv">
                {c.pricing.was} · {c.hero.tags.join(" · ")}
              </p>
              <p className="gloss rv">{c.hero.gloss}</p>
            </div>

            <div className="stack" aria-hidden="true">
              {c.hero.app.stack.map((label, i) => (
                <div className={`card card--${i + 1}`} key={label}>
                  <div className="card-lbl">
                    <span>{label}</span>
                  </div>
                </div>
              ))}

              <div className="card card--3">
                <div className="card-lbl">
                  <span>{c.hero.app.heading}</span>
                  <span>{c.hero.app.week}</span>
                </div>
                <div className="ask" id="hero-ask" />
                <div className="out" id="hero-out">
                  <div className="out-t">{c.hero.app.outLabel}</div>
                  <ul>
                    {c.hero.app.result.map((r, i) => (
                      <li key={r}>
                        <i>{i + 1}</i>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- pain ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.pain.eyebrow}</p>
            <h2 className="h2 rv">{c.pain.title}</h2>

            <div className="pains">
              {c.pain.items.map((it) => (
                <div className="pain rv" key={it.q}>
                  <q>{it.q}</q>
                  <p>{it.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- mechanism ---------------- */}
        <section className="section" id="method">
          <div className="shell">
            <p className="eyebrow rv">{c.mechanism.eyebrow}</p>
            <h2 className="h2 rv">{c.mechanism.title}</h2>
            <p className="lede rv">{c.mechanism.lede}</p>

            <div className="tiles">
              {c.mechanism.pillars.map((p) => (
                <article className="tile rv" key={p.n}>
                  <b>{p.n}</b>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>

            <figure className="setup rv">
              <figcaption>
                <span className="setup-t">{c.mechanism.example.label}</span>
                <h4>{c.mechanism.example.name}</h4>
              </figcaption>
              <div className="setup-lines">
                {c.mechanism.example.lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <p className="setup-note">{c.mechanism.example.note}</p>
            </figure>

            <p className="note rv">{c.mechanism.close}</p>
          </div>
        </section>

        {/* ---------------- pinned assembly scene ---------------- */}
        <AssemblyScene
          eyebrow={c.scene.eyebrow}
          title={c.scene.title}
          note={c.scene.note}
          counterLabel={c.scene.counter}
          items={c.outcomes.skills.map((s) => s.title)}
        />

        {/* ---------------- demo ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.demo.eyebrow}</p>
            <h2 className="h2 rv">{c.demo.title}</h2>
            <p className="lede rv">{c.demo.lede}</p>

            <div className="tabs rv" role="tablist" aria-label={c.demo.title}>
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
              key={example.id}
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

            <p className="note rv">{c.demo.note}</p>
          </div>
        </section>

        {/* ---------------- how it runs ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.method.eyebrow}</p>
            <h2 className="h2 rv">{c.method.title}</h2>
            <p className="lede rv">{c.method.lede}</p>

            <div className="tiles tiles--4">
              {c.method.steps.map((s) => (
                <article className="tile rv" key={s.n}>
                  <b>{s.n}</b>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>

            <div className="plat rv">
              <PlatformMock ui={c.method.ui} />
              <p className="plat-note">{c.method.platform}</p>
            </div>

            <p className="note note--warn rv">{c.method.note}</p>
          </div>
        </section>

        {/* ---------------- curriculum ---------------- */}
        <section className="section" id="curriculum">
          <div className="shell">
            <p className="eyebrow rv">{c.curriculum.eyebrow}</p>
            <h2 className="h2 rv">{c.curriculum.title}</h2>

            <div className="mods">
              {c.curriculum.modules.map((m) => (
                <article className="mod rv" key={m.n}>
                  <span className="mod-head">
                    <ModuleIcon n={m.n} />
                    <span className="mod-n">{m.n}</span>
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <div className="mod-res">
                    <i aria-hidden="true">→</i>
                    <span>{m.result}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- skills ---------------- */}
        <section className="section" id="skills">
          <div className="shell">
            <p className="eyebrow rv">{c.outcomes.eyebrow}</p>
            <h2 className="h2 rv">{c.outcomes.title}</h2>
            <p className="lede rv">{c.outcomes.sub}</p>

            <div className="skills">
              {c.outcomes.skills.map((s, i) => (
                <article className="skill rv" key={s.title}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>

            <div className="stats">
              {c.outcomes.stats.map((s) => (
                <div className="stat rv" key={s.l}>
                  <b data-value={s.v}>{s.v}</b>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- testimonials ----------------
            Renders only once real, attributed quotes exist. */}
        {c.testimonials.items.length > 0 && (
          <section className="section">
            <div className="shell">
              <p className="eyebrow rv">{c.testimonials.eyebrow}</p>
              <h2 className="h2 rv">{c.testimonials.title}</h2>

              <div className="quotes">
                {c.testimonials.items.map((t) => (
                  <figure className="quote rv" key={t.name}>
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
        <section className="section">
          <div className="shell">
            <div className="costbox rv">
              <p className="eyebrow">{c.cost.eyebrow}</p>
              <h2 className="h2">{c.cost.title}</h2>
              <p className="cost-text">{c.cost.text}</p>
              <a className="btn btn--acc" href="#pricing">
                {c.cost.cta} — {c.pricing.now}
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- faq ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.faq.eyebrow}</p>
            <h2 className="h2 rv">{c.faq.title}</h2>

            <div className="faq-list rv">
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
                    <div className="faq-body">
                      <div>
                        <p
                          className="faq-a"
                          id={`faq-a-${i}`}
                          role="region"
                          aria-labelledby={`faq-q-${i}`}
                        >
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- pricing + form ---------------- */}
        <section className="section" id="pricing">
          <div className="shell">
            <p className="eyebrow rv">{c.pricing.eyebrow}</p>
            <h2 className="h2 rv">{c.pricing.title}</h2>
            <p className="lede rv">{c.pricing.sub}</p>

            <div className="buy">
              <div className="panel rv">
                <div className="price">
                  <span>{c.pricing.now}</span>
                  <s>{c.pricing.was}</s>
                  <span className="price-save">−50%</span>
                </div>

                <ul className="incl">
                  {c.pricing.includes.map((i) => (
                    <li key={i}>
                      <i aria-hidden="true">✓</i>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel rv">
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
