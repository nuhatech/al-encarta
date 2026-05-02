import { describe, it, expect } from "vitest";
import { VoiceComposer } from "@/src/modules/catalog/application/services/voice-composer";
import { Personality } from "@/src/modules/catalog/domain/personality";
import { unwrap } from "@/src/shared/kernel/result";
import alKhawarizmi from "@/src/modules/catalog/data/tier1/al-khawarizmi.json";

const composer = new VoiceComposer();
const khawarizmi = unwrap(Personality.create(alKhawarizmi));

describe("VoiceComposer", () => {
  it("emits exactly two system blocks", () => {
    const blocks = composer.compose(khawarizmi);
    expect(blocks).toHaveLength(2);
  });

  it("marks both blocks with ephemeral cache_control", () => {
    const blocks = composer.compose(khawarizmi);
    expect(blocks[0]?.cache_control?.type).toBe("ephemeral");
    expect(blocks[1]?.cache_control?.type).toBe("ephemeral");
  });

  it("is byte-stable across invocations (cache hit critical)", () => {
    const a = composer.compose(khawarizmi);
    const b = composer.compose(khawarizmi);
    expect(a[0]?.text).toBe(b[0]?.text);
    expect(a[1]?.text).toBe(b[1]?.text);
  });

  it("includes the personality display name in the second block", () => {
    const blocks = composer.compose(khawarizmi);
    expect(blocks[1]?.text).toContain("al-Khawarizmi");
  });

  it("global preamble is identical across personalities (cache prefix)", () => {
    // Two clones of the same personality must produce the same first block.
    // (We don't have a 2nd personality yet — this test will strengthen with tier 1 complete.)
    const clone = unwrap(Personality.create(alKhawarizmi));
    const a = composer.compose(khawarizmi);
    const b = composer.compose(clone);
    expect(a[0]?.text).toBe(b[0]?.text);
  });

  it("global preamble has enough characters to potentially exceed cache threshold", () => {
    // Sonnet's cache eligibility kicks in around 1024 tokens (~3-4 KB depending on language).
    const blocks = composer.compose(khawarizmi);
    expect((blocks[0]?.text ?? "").length).toBeGreaterThan(1500);
  });
});
