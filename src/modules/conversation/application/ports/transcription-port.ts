export interface TranscriptionRequest {
  readonly audio: Blob;
  readonly mimeType: string;
  readonly languageHint?: "fr" | "en" | "ar";
}

export interface TranscriptionResult {
  readonly text: string;
  readonly durationMs: number;
}

export interface TranscriptionGateway {
  transcribe(input: TranscriptionRequest): Promise<TranscriptionResult>;
}
