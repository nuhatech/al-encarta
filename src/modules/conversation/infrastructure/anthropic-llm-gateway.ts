import type {
  LlmGateway,
  LlmRequest,
  StreamChunk,
} from "@/src/modules/conversation/application/ports/llm-port";
import { GatewayError } from "@/src/shared/kernel/errors";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Edge-runtime-friendly Anthropic client. Direct fetch (no SDK) to keep the
 * Cloudflare Worker bundle small and to control SSE parsing precisely.
 *
 * Streams Anthropic SSE events and re-emits typed StreamChunk on a
 * ReadableStream that the route handler converts to wire SSE.
 */
export class AnthropicLlmGateway implements LlmGateway {
  constructor(private readonly apiKey: string) {}

  async streamCompletion(req: LlmRequest): Promise<ReadableStream<StreamChunk>> {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens,
        system: req.systemBlocks,
        messages: req.messages,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      throw new GatewayError("anthropic", upstream.status, text.slice(0, 300));
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream<StreamChunk>({
      async pull(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue({ type: "done" });
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });

            // Parse SSE: blocks separated by blank line, each line is `event:` or `data:`.
            let sep: number;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
              const block = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);

              const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
              if (!dataLine) continue;
              const json = dataLine.slice(5).trim();
              if (!json || json === "[DONE]") continue;

              try {
                const parsed: unknown = JSON.parse(json);
                const delta = extractTextDelta(parsed);
                if (delta) controller.enqueue({ type: "text-delta", delta });
              } catch {
                // skip malformed event
              }
            }
          }
        } catch (e) {
          controller.enqueue({
            type: "error",
            message: e instanceof Error ? e.message : String(e),
          });
          controller.close();
        }
      },
    });
  }
}

function extractTextDelta(event: unknown): string | null {
  if (typeof event !== "object" || event === null) return null;
  const e = event as { type?: string; delta?: { type?: string; text?: string } };
  if (e.type === "content_block_delta" && e.delta?.type === "text_delta" && typeof e.delta.text === "string") {
    return e.delta.text;
  }
  return null;
}
