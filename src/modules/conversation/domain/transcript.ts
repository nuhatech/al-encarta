import type { Message } from "./message";

export interface TranscriptTurn {
  readonly role: "user" | "assistant";
  readonly content: string;
}

/**
 * Immutable snapshot of a conversation suitable for sending to an LLM.
 * Drops system messages and metadata, keeps the alternating user/assistant flow.
 */
export class Transcript {
  private constructor(public readonly turns: ReadonlyArray<TranscriptTurn>) {}

  static from(messages: ReadonlyArray<Message>): Transcript {
    const turns: TranscriptTurn[] = [];
    for (const m of messages) {
      if (m.role === "user" || m.role === "assistant") {
        turns.push({ role: m.role, content: m.content });
      }
    }
    return new Transcript(turns);
  }

  static empty(): Transcript {
    return new Transcript([]);
  }

  get length(): number {
    return this.turns.length;
  }
}
