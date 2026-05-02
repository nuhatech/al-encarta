import type { Id } from "@/src/shared/kernel/id";

export interface SendMessageCommand {
  readonly conversationId: Id<"Conversation">;
  readonly personalityId: Id<"Personality">;
  readonly userText: string;
  readonly transcript: ReadonlyArray<{
    readonly role: "user" | "assistant";
    readonly content: string;
  }>;
}
