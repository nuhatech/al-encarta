import type {
  TranscriptionGateway,
  TranscriptionRequest,
  TranscriptionResult,
} from "@/src/modules/conversation/application/ports/transcription-port";

/**
 * Mock STT used when MISTRAL_API_KEY is missing. Returns a placeholder
 * transcription so the UI can be exercised end-to-end without the real API.
 */
export class FakeTranscriptionGateway implements TranscriptionGateway {
  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    const startedAt = Date.now();
    // Simulate ~600ms of network/inference latency.
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sizeKb = Math.round(input.audio.size / 1024);
    return {
      text: `[Transcription mock — ${sizeKb} KB d'audio reçus] Configurez MISTRAL_API_KEY dans .env.local pour activer Voxtral.`,
      durationMs: Date.now() - startedAt,
    };
  }
}
