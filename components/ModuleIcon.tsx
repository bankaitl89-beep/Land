/**
 * One drawing per module, in a single geometric language: 1.6px strokes on a
 * 32 grid, indigo for the live part and a muted line for the rest. They mark
 * what each module is about — not decoration bolted onto a card.
 */
const paths: Record<string, React.ReactNode> = {
  // base: reading the machine — a lattice with one node lit
  "01": (
    <>
      <path d="M6 10h20M6 16h20M6 22h20" />
      <path d="M11 6v20M21 6v20" />
      <circle cx="21" cy="16" r="3.2" className="hot" />
    </>
  ),
  // beginner: the chat itself — a thread with a file and a voice line
  "02": (
    <>
      <path d="M5 8h13v9H9l-4 4z" />
      <path d="M22 11h5v10h-4l-3 3v-3h-3" className="hot" />
      <path d="M23.5 15v3" className="hot" />
    </>
  ),
  // intermediate: asking properly — a brief narrowing to one answer
  "03": (
    <>
      <path d="M5 8h18M5 13h14M5 18h10" />
      <path d="M5 24h7" />
      <path d="M19 22h7M23 19l3 3-3 3" className="hot" />
    </>
  ),
  // advanced: the routine that runs itself — a closed loop
  "04": (
    <>
      <path d="M8 16a8 8 0 0 1 8-8 8 8 0 0 1 7 4" />
      <path d="M24 16a8 8 0 0 1-8 8 8 8 0 0 1-7-4" />
      <path d="M23 6v6h-6" className="hot" />
      <path d="M9 26v-6h6" className="hot" />
    </>
  ),
  // bonus: forty-nine minutes — a clock with a short arc
  "05": (
    <>
      <circle cx="16" cy="16" r="10" />
      <path d="M16 10v6l4.5 2.5" className="hot" />
      <path d="M16 6a10 10 0 0 1 8.7 5" className="hot" />
    </>
  ),
  // what comes next: a team picking it up — blocks handed on
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
