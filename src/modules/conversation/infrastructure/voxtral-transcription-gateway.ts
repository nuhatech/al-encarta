import type {
  TranscriptionGateway,
  TranscriptionRequest,
  TranscriptionResult,
} from "@/src/modules/conversation/application/ports/transcription-port";
import { GatewayError } from "@/src/shared/kernel/errors";

const MISTRAL_TRANSCRIPTION_URL = "https://api.mistral.ai/v1/audio/transcriptions";
const MODEL = "voxtral-mini-latest";

/**
 * Mistral La Plateforme — Voxtral Mini Transcribe.
 *
 * Pricing (as of 2026-01): ~$0.001 / minute, multilingual including FR + Arabic.
 * Edge-runtime-friendly: uses fetch + FormData, no SDK.
 */
export class VoxtralTranscriptionGateway implements TranscriptionGateway {
  constructor(private readonly apiKey: string) {}

  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    const startedAt = Date.now();

    const form = new FormData();
    // Mistral expects a File-like object with a name; provide one with a sane extension.
    const ext = pickExt(input.mimeType);
    const file = new File([input.audio], `audio.${ext}`, { type: input.mimeType });
    form.append("file", file);
    form.append("model", MODEL);
    if (input.languageHint) form.append("language", input.languageHint);

    const res = await fetch(MISTRAL_TRANSCRIPTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError("mistral.voxtral", res.status, text.slice(0, 300));
    }

    const json = (await res.json()) as { text?: string };
    return {
      text: typeof json.text === "string" ? json.text : "",
      durationMs: Date.now() - startedAt,
    };
  }
}

function pickExt(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4") || m.includes("aac")) return "m4a";
  if (m.includes("mpeg")) return "mp3";
  if (m.includes("wav")) return "wav";
  return "bin";
}
