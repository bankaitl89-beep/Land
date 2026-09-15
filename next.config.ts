import type { NextConfig } from "next";

// `npm run preview` sets NEXT_EXPORT=1 to produce a static, self-contained
// build of the page for design review. The production build (Vercel) keeps
// the server runtime so /api/lead can reach Telegram.
const isExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? { output: "export" as const, assetPrefix: "./", images: { unoptimized: true } }
    : // a standalone server bundle, so the VPS can run `node server.js` with
      // only the files it actually needs instead of the whole node_modules
      { output: "standalone" as const }),
};

export default nextConfig;
