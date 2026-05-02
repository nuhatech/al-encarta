"use client";

/**
 * Client-side conversation persistence.
 *
 * Originally planned for IndexedDB via Dexie, but Dexie hits "UnknownError on
 * open()" issues in Chrome sandboxed contexts (and dev hot-reload). For the
 * hackathon scope (a few hundred turns max, no multi-tab sync needed),
 * localStorage is plenty: synchronous, ubiquitous, ~5MB quota.
 *
 * The interface stays async-shaped so we can swap in IndexedDB later without
 * touching call sites.
 */

export interface PersistedMessage {
  personalitySlug: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

const STORAGE_PREFIX = "encarta-2001:messages:";

function key(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function load(slug: string): PersistedMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPersistedMessage);
  } catch {
    return [];
  }
}

function save(slug: string, messages: ReadonlyArray<PersistedMessage>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(messages));
  } catch {
    // Quota exceeded or storage disabled — fail silently for hackathon.
  }
}

function isPersistedMessage(v: unknown): v is PersistedMessage {
  if (typeof v !== "object" || v === null) return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.personalitySlug === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.createdAt === "number"
  );
}

export const conversationRepo = {
  async listForPersonality(slug: string): Promise<ReadonlyArray<PersistedMessage>> {
    return load(slug);
  },

  async append(
    slug: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<void> {
    const current = load(slug);
    current.push({ personalitySlug: slug, role, content, createdAt: Date.now() });
    save(slug, current);
  },

  async clear(slug: string): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key(slug));
  },
};
