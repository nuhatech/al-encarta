import { NextResponse } from "next/server";
import { idOf } from "@/src/shared/kernel/id";
import { StaticPersonalityRepository } from "@/src/modules/catalog/infrastructure/static-personality-repo";
import { VoiceComposer } from "@/src/modules/catalog/application/services/voice-composer";
import { FakeLlmGateway } from "@/src/modules/conversation/infrastructure/fake-llm-gateway";
import { AnthropicLlmGateway } from "@/src/modules/conversation/infrastructure/anthropic-llm-gateway";
import { OpenAiLlmGateway } from "@/src/modules/conversation/infrastructure/openai-llm-gateway";
import {
  makeSendMessageHandler,
  type ModelMapping,
} from "@/src/modules/conversation/application/commands/send-message";
import type { LlmGateway, StreamChunk } from "@/src/modules/conversation/application/ports/llm-port";

// Composition root for the chat endpoint.
// Provider preference: Anthropic > OpenAI > Fake. Models are pinned per provider.
function buildHandler() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let llm: LlmGateway;
  let models: ModelMapping;

  if (anthropicKey) {
    llm = new AnthropicLlmGateway(anthropicKey);
    models = { tier1: "claude-sonnet-4-6", tier2: "claude-haiku-4-5" };
  } else if (openaiKey) {
    llm = new OpenAiLlmGateway(openaiKey);
    // Non-reasoning models for snappy chat. gpt-4.1-mini = quality + speed.
    models = { tier1: "gpt-4.1-mini", tier2: "gpt-4.1-mini" };
  } else {
    llm = new FakeLlmGateway();
    models = { tier1: "fake", tier2: "fake" };
  }

  return makeSendMessageHandler({
    llm,
    personalityRepo: new StaticPersonalityRepository(),
    voiceComposer: new VoiceComposer(),
    models,
  });
}

interface ChatRequestBody {
  conversationId?: string;
  personalityId?: string;
  userText?: string;
  transcript?: ReadonlyArray<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.personalityId || typeof body.personalityId !== "string") {
    return NextResponse.json({ error: "personalityId_required" }, { status: 400 });
  }
  if (!body.userText || typeof body.userText !== "string") {
    return NextResponse.json({ error: "userText_required" }, { status: 400 });
  }

  const handler = buildHandler();
  let chunkStream: ReadableStream<StreamChunk>;
  try {
    chunkStream = await handler({
      conversationId: idOf<"Conversation">(body.conversationId ?? "anon"),
      personalityId: idOf<"Personality">(body.personalityId),
      userText: body.userText,
      transcript: body.transcript ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Convert typed chunks into SSE wire format.
  const encoder = new TextEncoder();
  const sseStream = chunkStream.pipeThrough(
    new TransformStream<StreamChunk, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      },
    }),
  );

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
