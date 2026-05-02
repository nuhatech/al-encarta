import type { SystemBlock } from "@/src/modules/catalog/application/services/voice-composer";

export interface LlmRequest {
  readonly model: string;
  readonly maxTokens: number;
  readonly systemBlocks: ReadonlyArray<SystemBlock>;
  readonly messages: ReadonlyArray<{
    readonly role: "user" | "assistant";
    readonly content: string;
  }>;
}

export type StreamChunk =
  | { readonly type: "text-delta"; readonly delta: string }
  | { readonly type: "done" }
  | { readonly type: "error"; readonly message: string };

export interface LlmGateway {
  streamCompletion(req: LlmRequest): Promise<ReadableStream<StreamChunk>>;
}
