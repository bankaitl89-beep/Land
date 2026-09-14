/**
 * One drawing per module, in a single geometric language: 1.6px strokes on a
 * 32 grid, indigo for the live part and a muted line for the rest. They mark
 * what each module is about — not decoration bolted onto a card.
 */
const paths: Record<string, React.ReactNode> = {
  // reading the machine: a lattice with one node lit
  "01": (
    <>
      <path d="M6 10h20M6 16h20M6 22h20" />
      <path d="M11 6v20M21 6v20" />
      <circle cx="21" cy="16" r="3.2" className="hot" />
    </>
  ),
  // asking properly: a brief narrowing to one answer
  "02": (
    <>
      <path d="M5 8h18M5 13h14M5 18h10" />
      <path d="M5 24h7" />
      <path d="M19 22h7M23 19l3 3-3 3" className="hot" />
    </>
  ),
  // documents: many sheets, one distilled
  "03": (
    <>
      <path d="M6 6h11l4 4v9H6z" />
      <path d="M17 6v4h4" />
      <path d="M11 24h15v-8" className="hot" />
      <path d="M15 20h7M15 23.5h4" className="hot" />
    </>
  ),
  // a helper that remembers: an orbit around a core
  "04": (
    <>
      <circle cx="16" cy="16" r="4" className="hot" />
      <ellipse cx="16" cy="16" rx="10.5" ry="5.5" />
      <ellipse cx="16" cy="16" rx="10.5" ry="5.5" transform="rotate(60 16 16)" />
      <circle cx="26" cy="13" r="1.6" className="hot solid" />
    </>
  ),
  // the routine that runs itself: a closed loop
  "05": (
    <>
      <path d="M8 16a8 8 0 0 1 8-8 8 8 0 0 1 7 4" />
      <path d="M24 16a8 8 0 0 1-8 8 8 8 0 0 1-7-4" />
      <path d="M23 6v6h-6" className="hot" />
      <path d="M9 26v-6h6" className="hot" />
    </>
  ),
  // your own tools: blocks you assemble
  "06": (
    <>
      <path d="M5 7h9v9H5zM18 7h9v9h-9zM5 20h9v6H5z" />
      <path d="M18 20h9v6h-9z" className="hot" />
      <path d="M22.5 21.5v3M21 23h3" className="hot" />
    </>
  ),
};

export default function ModuleIcon({ n }: { n: string }) {
  return (
    <svg
      className="mod-ico"
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[n] ?? paths["01"]}
    </svg>
  );
}
