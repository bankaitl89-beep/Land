"use client";

import { useEffect, useState } from "react";
import { content, type Lang } from "@/lib/content";
import { LANGS, LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_LABEL } from "@/lib/i18n";
import AssemblyScene from "./AssemblyScene";
import Cursor from "./Cursor";
import ModuleIcon from "./ModuleIcon";
import PlatformMock from "./PlatformMock";
import PromptBuilder from "./PromptBuilder";
import NeuralField from "./NeuralField";
import { useDepthEffects, useTypewriter } from "./useDepthEffects";
import LeadForm from "./LeadForm";

/* The mark is a P drawn as a neuron: an ember stem — the prompt caret you
   type into — and the bowl replaced by three ice nodes wired back to it.
   The two colours are the page’s own system, warm for you and cool for the
   machine, and it still reads as a P at 16px in a tab. */
function Mark() {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <g
        stroke="var(--cool)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".85"
      >
        <path d="M8.4 5.6 13.4 5.6" />
        <path d="M13.4 5.6 18.6 9.6" />
        <path d="M18.6 9.6 13.4 13.6" />
        <path d="M13.4 13.6 8.4 13.6" />
      </g>
      <g fill="var(--cool)">
        <circle cx="13.4" cy="5.6" r="2.2" />
        <circle cx="18.6" cy="9.6" r="2.2" />
        <circle cx="13.4" cy="13.6" r="2.2" />
      </g>
      <rect x="5.6" y="4" width="3.2" height="18" rx="1.1" fill="var(--acc)" />
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

  /* On a server the middleware picks the language before the page is even
     sent. A static build has no middleware, so the one file has to do it
     itself, once, from the browser's own setting. */
  useEffect(() => {
    if (!preview) return;
    const want = (navigator.languages ?? [navigator.language ?? ""])
      .map((t) => t.slice(0, 2).toLowerCase())
      .find((t): t is Lang => LANGS.includes(t as Lang));
    if (want) setPreviewLang(want);
  }, [preview]);

  useDepthEffects(lang);
  useTypewriter("hero-ask", "hero-out", c.demo.tabs[0].good.prompt);

  // Remember the choice so "/" sends this visitor straight here next time.
  function remember(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${LANG_COOKIE_MAX_AGE};samesite=lax`;
  }

  return (
    <>
      <NeuralField tasks={c.field.tasks} />
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

              <p className="hero-price rv">
                <span className="hp-old">{c.hero.was}</span>
                <span className="hp-new">{c.hero.now}</span>
                <span className="hp-off">{c.hero.save}</span>
              </p>
              <p className="hero-meta rv">{c.hero.tags.join(" · ")}</p>
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

        {/* ---------------- who teaches it ---------------- */}
        <section className="cred">
          <div className="shell cred-in">
            <div className="cred-copy">
              <p className="eyebrow rv">{c.authority.eyebrow}</p>
              <p className="cred-line rv">{c.authority.line}</p>
              <p className="cred-note rv">{c.authority.note}</p>
            </div>
            <ul className="cred-list rv">
              {c.authority.items.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- who it's for ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.who.eyebrow}</p>
            <h2 className="h2 h2--sm rv">{c.who.title}</h2>
            <p className="lede rv">{c.who.sub}</p>

            <dl className="whos">
              {c.who.items.map((it) => (
                <div className="who rv" key={it.role}>
                  <dt>{it.role}</dt>
                  <dd>{it.task}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------- pain ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.pain.eyebrow}</p>
            <h2 className="h2 rv">{c.pain.title}</h2>

            <div className="pains">
              {c.pain.items.map((it, i) => (
                <div className="pain rv" key={it.q}>
                  <span className="pain-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <q>{it.q}</q>
                  <p>{it.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- what you build, and how it is taught ----------
            These were two sections making the same argument: one said you
            build setups and a teacher checks them, the other said lessons
            are checked before the next one opens. Merged, with the three
            pillars dropped — the four steps already said it. */}
        <section className="section sec--rail" id="method">
          <div className="shell rail">
            <p className="eyebrow rail-tag rv">{c.mechanism.eyebrow}</p>

            <div className="rail-body">
              <h2 className="h2 h2--lg rv">{c.mechanism.title}</h2>
              <p className="lede rv">{c.mechanism.lede}</p>

              <figure className="setup rv">
                <figcaption>
                  <span className="setup-t">{c.mechanism.example.label}</span>
                  <h3>{c.mechanism.example.name}</h3>
                </figcaption>
                <p className="setup-lbl">{c.mechanism.example.askLabel}</p>
                <div className="setup-lines">
                  {c.mechanism.example.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>

                <p className="setup-lbl setup-lbl--out">
                  {c.mechanism.example.outLabel}
                </p>
                <ul className="setup-out">
                  {c.mechanism.example.out.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <div className="setup-ba">
                  <p className="setup-was">{c.mechanism.example.before}</p>
                  <p className="setup-now">{c.mechanism.example.after}</p>
                </div>

                <p className="setup-note">{c.mechanism.example.note}</p>
              </figure>

              <p className="note rv">{c.mechanism.close}</p>

              <div className="runs">
                <h3 className="h2 h2--sm rv">{c.method.title}</h3>
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
            </div>
          </div>
        </section>

        {/* ---------------- demo ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.demo.eyebrow}</p>
            <h2 className="h2 rv">{c.demo.title}</h2>
            <p className="lede rv">{c.demo.lede}</p>

            <div
              className="tabs rv"
              role="tablist"
              aria-label={c.demo.title}
              onKeyDown={(e) => {
                const last = c.demo.tabs.length - 1;
                const to =
                  e.key === "ArrowRight" ? (tab === last ? 0 : tab + 1)
                  : e.key === "ArrowLeft" ? (tab === 0 ? last : tab - 1)
                  : e.key === "Home" ? 0
                  : e.key === "End" ? last
                  : null;
                if (to === null) return;
                e.preventDefault();
                setTab(to);
                document.getElementById(`tab-${c.demo.tabs[to].id}`)?.focus();
              }}
            >
              {c.demo.tabs.map((t, i) => (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  className="tab"
                  aria-selected={i === tab}
                  // only the selected panel exists in the DOM, so only the
                  // selected tab may claim to control one
                  aria-controls={i === tab ? `panel-${t.id}` : undefined}
                  tabIndex={i === tab ? 0 : -1}
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
                <div className="cmp-out">
                  {example.bad.result.map((line) => (
                    <p
                      key={line}
                      className={line.startsWith("\u2192") ? "is-sub" : undefined}
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <p className="cmp-verdict">{example.bad.verdict}</p>
              </article>

              <article className="cmp cmp--good">
                <h3 className="cmp-label">{c.demo.goodLabel}</h3>
                <pre className="cmp-prompt">{example.good.prompt.join("\n")}</pre>
                <p className="cmp-res-label">{c.demo.resultLabel}</p>
                <div className="cmp-out cmp-out--good">
                  {example.good.result.map((line) => (
                    <p
                      key={line}
                      className={line.startsWith("\u2192") ? "is-sub" : undefined}
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <p className="cmp-verdict cmp-verdict--good">
                  {example.good.verdict}
                </p>
              </article>
            </div>

            <p className="note rv">{c.demo.note}</p>
          </div>
        </section>

        {/* ---------------- try it on your own job ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.builder.eyebrow}</p>
            <h2 className="h2 rv">{c.builder.title}</h2>
            <p className="lede rv">{c.builder.lede}</p>

            <div className="rv">
              <PromptBuilder c={c.builder} />
            </div>

            <p className="note rv">{c.builder.note}</p>
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

        {/* ---------------- curriculum ---------------- */}
        <section className="section" id="curriculum">
          <div className="shell cur-in">
            <div className="cur-head">
              <p className="eyebrow rv">{c.curriculum.eyebrow}</p>
              <h2 className="h2 rv">{c.curriculum.title}</h2>
              <p className="lede rv">{c.curriculum.sub}</p>
            </div>

            <ol className="track">
              {c.curriculum.modules.map((m) => (
                <li className="leg rv" key={m.n}>
                  <span className="leg-mark">
                    <ModuleIcon n={m.n} />
                  </span>
                  <div className="leg-body">
                    <span className="leg-n">{m.n}</span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <span className="leg-res">{m.result}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- skills ---------------- */}
        <section className="section" id="skills">
          <div className="shell">
            <p className="eyebrow rv">{c.outcomes.eyebrow}</p>
            <h2 className="h2 h2--sm rv">{c.outcomes.title}</h2>
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
        {/* the one full-bleed moment on the page: the ground changes, the
            type goes up a size, and nothing else competes for the screen */}
        <section className="band">
          <div className="shell band-in">
            <p className="eyebrow rv">{c.cost.eyebrow}</p>
            <h2 className="h2 h2--lg rv">{c.cost.title}</h2>
            <p className="cost-text rv">{c.cost.text}</p>
            <a className="btn btn--acc rv" href="#pricing">
              {c.cost.cta} — {c.pricing.now}
            </a>
          </div>
        </section>

        {/* ---------------- faq ---------------- */}
        <section className="section">
          <div className="shell">
            <p className="eyebrow rv">{c.faq.eyebrow}</p>
            <h2 className="h2 h2--sm rv">{c.faq.title}</h2>

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
            <h2 className="h2 h2--lg rv">{c.pricing.title}</h2>
            <p className="lede rv">{c.pricing.sub}</p>

            <div className="buy">
              <div className="panel panel--lit rv">
                <i className="trace" aria-hidden="true" />
                <div className="price">
                  <span>{c.pricing.now}</span>
                  <s>{c.pricing.was}</s>
                  <span className="price-save">{c.hero.save}</span>
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
