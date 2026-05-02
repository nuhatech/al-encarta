export interface TranscribeAudioCommand {
  readonly audio: Blob;
  readonly mimeType: string;
  readonly languageHint?: "fr" | "en" | "ar";
}
