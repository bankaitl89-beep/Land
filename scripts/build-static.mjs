// Builds the landing as one self-contained folder and zips it, ready to
// upload to a tracker or any static host. No server, no API route, no secret
// in the page: the form posts straight to whatever NEXT_PUBLIC_LEAD_ENDPOINT
// points at.
//
//   NEXT_PUBLIC_LEAD_ENDPOINT=https://... npm run static
//
// Leave the endpoint unset and the form will post to /api/lead, which only
// exists when the project runs on a server — the build says so rather than
// letting a dead form ship.
import { execSync } from "node:child_process";
import { statSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
if (!endpoint) {
  console.warn(
    "\n  ! NEXT_PUBLIC_LEAD_ENDPOINT is not set, so the form will post to\n" +
      "    /api/lead — which does not exist in a static build. Leads would be\n" +
      "    lost. Set it to a form service URL and build again.\n",
  );
} else if (!/^https:\/\//.test(endpoint)) {
  console.error(`\n  ✗ NEXT_PUBLIC_LEAD_ENDPOINT must be an https URL, got: ${endpoint}\n`);
  process.exit(1);
}

execSync("node scripts/build-preview.mjs", { stdio: "inherit" });

const dir = join(process.cwd(), "preview");
const zip = join(process.cwd(), "landing.zip");
rmSync(zip, { force: true });
execSync(`cd ${JSON.stringify(dir)} && zip -qr ${JSON.stringify(zip)} .`, { stdio: "inherit" });

const size = (p) => (statSync(p).size / 1024).toFixed(0);
const files = readdirSync(dir, { recursive: true }).length;
console.log(`\n  landing.zip — ${size(zip)}KB, ${files} files`);
console.log(`  leads go to: ${endpoint ?? "/api/lead (needs a server!)"}\n`);
