import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Cloudflare Workers via OpenNext: all routes run on Workers runtime
  // (Node.js compat enabled in wrangler.jsonc). No need for `runtime: 'edge'`
  // on individual route handlers.
};

// Wires Cloudflare bindings (env, R2, etc.) into `next dev` so process.env works locally.
initOpenNextCloudflareForDev();

export default nextConfig;
