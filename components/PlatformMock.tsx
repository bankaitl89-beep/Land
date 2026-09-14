"use client";

type Lesson = { state: string; title: string; meta: string };

/**
 * A drawn view of the learning platform: the lesson list on the left, an
 * open lesson on the right with the student's own setup and the teacher's
 * correction underneath. Stands in for real screenshots, and shows the one
 * thing no competitor has — a person reading the work.
 */
export default function PlatformMock({
  ui,
}: {
  ui: {
    brand: string;
    week: string;
    progress: string;
    moduleLabel: string;
    lessons: readonly Lesson[];
    lessonTitle: string;
    yours: string;
    yourLines: readonly string[];
    reviewBy: string;
    review: string;
    actions: readonly string[];
  };
}) {
  return (
    <div className="app" aria-hidden="true">
      <div className="app-bar">
        <span className="app-brand">
          <i className="app-dot" />
          {ui.brand}
        </span>
        <span className="app-week">
          {ui.week}
          <b>{ui.progress}</b>
        </span>
      </div>

      <div className="app-body">
        <aside className="app-side">
          <p className="app-module">{ui.moduleLabel}</p>
          <div className="app-track">
            <i style={{ width: ui.progress }} />
          </div>
          <ul className="app-list">
            {ui.lessons.map((l) => (
              <li key={l.title} data-state={l.state}>
                <span className="app-ico">
                  {l.state === "done" ? "✓" : l.state === "now" ? "▶" : "🔒"}
                </span>
                <span className="app-txt">
                  {l.title}
                  <em>{l.meta}</em>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="app-main">
          <h4 className="app-title">{ui.lessonTitle}</h4>

          <div className="app-block">
            <span className="app-lbl">{ui.yours}</span>
            <div className="app-code">
              {ui.yourLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          <div className="app-block app-block--review">
            <span className="app-lbl app-lbl--acc">{ui.reviewBy}</span>
            <p className="app-review">{ui.review}</p>
          </div>

          <div className="app-actions">
            <span className="app-btn app-btn--acc">{ui.actions[0]}</span>
            <span className="app-btn">{ui.actions[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
