import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Hackathon scope: no incremental cache, no R2, no queues.
  // Stateless edge runtime — all persistence is client-side (IndexedDB).
});
