import { NextResponse } from "next/server";
import { makeTranscribeAudioHandler } from "@/src/modules/conversation/application/commands/transcribe-audio";
import { VoxtralTranscriptionGateway } from "@/src/modules/conversation/infrastructure/voxtral-transcription-gateway";
import { FakeTranscriptionGateway } from "@/src/modules/conversation/infrastructure/fake-transcription-gateway";
import type { TranscriptionGateway } from "@/src/modules/conversation/application/ports/transcription-port";
import { GatewayError, ValidationError } from "@/src/shared/kernel/errors";

async function readSecret(name: string): Promise<string | undefined> {
  if (process.env[name]) return process.env[name];
  try {
    const mod = await import("@opennextjs/cloudflare");
    const env = mod.getCloudflareContext()?.env as
      | Record<string, string | undefined>
      | undefined;
    return env?.[name];
  } catch {
    return undefined;
  }
}

async function buildHandler() {
  const apiKey = await readSecret("MISTRAL_API_KEY");
  const gateway: TranscriptionGateway = apiKey
    ? new VoxtralTranscriptionGateway(apiKey)
    : new FakeTranscriptionGateway();
  return makeTranscribeAudioHandler({ transcription: gateway });
}

export async function POST(req: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "audio_required" }, { status: 400 });
  }

  const language = form.get("language");
  const languageHint =
    language === "fr" || language === "en" || language === "ar" ? language : "fr";

  const handler = await buildHandler();
  try {
    const result = await handler({
      audio,
      mimeType: audio.type || "audio/webm",
      languageHint,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: `${e.field}:${e.reason}` }, { status: 400 });
    }
    if (e instanceof GatewayError) {
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "internal" },
      { status: 500 },
    );
  }
}
