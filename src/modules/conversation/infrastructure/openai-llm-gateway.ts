import type {
  LlmGateway,
  LlmRequest,
  StreamChunk,
} from "@/src/modules/conversation/application/ports/llm-port";
import { GatewayError } from "@/src/shared/kernel/errors";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/**
 * OpenAI Chat Completions adapter implementing LlmGateway.
 *
 * Translation choices:
 * - VoiceComposer's two SystemBlocks are fused into a single `system` message
 *   joined by a stable separator. The byte-stable prefix still triggers
 *   OpenAI's automatic prompt caching once the prompt crosses ~1024 tokens.
 * - `cache_control: ephemeral` flags are ignored (OpenAI caches automatically,
 *   no opt-in needed). The byte-stability test in voice-composer remains valid.
 */
export class OpenAiLlmGateway implements LlmGateway {
  constructor(private readonly apiKey: string) {}

  async streamCompletion(req: LlmRequest): Promise<ReadableStream<StreamChunk>> {
    const systemContent = req.systemBlocks.map((b) => b.text).join("\n\n");
    const messages = [
      { role: "system", content: systemContent },
      ...req.messages,
    ];

    // Reasoning models (gpt-5*, o-series) bill *reasoning tokens* against
    // max_completion_tokens. A 1024 cap can be fully consumed by hidden
    // reasoning, leaving 0 visible output. We give the visible answer a
    // generous floor and let the API's own per-model cap do the rest.
    const isReasoningModel = /^gpt-5|^o[1-9]/i.test(req.model);
    const completionCap = isReasoningModel
      ? Math.max(req.maxTokens * 4, 4096)
      : req.maxTokens;

    const upstream = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: req.model,
        max_completion_tokens: completionCap,
        messages,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      throw new GatewayError("openai", upstream.status, text.slice(0, 300));
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

            let sep: number;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
              const block = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);

              const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
              if (!dataLine) continue;
              const json = dataLine.slice(5).trim();
              if (!json) continue;
              if (json === "[DONE]") {
                controller.enqueue({ type: "done" });
                controller.close();
                return;
              }

              try {
                const parsed: unknown = JSON.parse(json);
                const delta = extractContentDelta(parsed);
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

function extractContentDelta(event: unknown): string | null {
  if (typeof event !== "object" || event === null) return null;
  const e = event as {
    choices?: ReadonlyArray<{ delta?: { content?: string } }>;
  };
  const content = e.choices?.[0]?.delta?.content;
  return typeof content === "string" && content.length > 0 ? content : null;
}
