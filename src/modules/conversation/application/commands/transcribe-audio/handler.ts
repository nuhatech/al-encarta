import type {
  TranscriptionGateway,
  TranscriptionResult,
} from "@/src/modules/conversation/application/ports/transcription-port";
import type { TranscribeAudioCommand } from "./command";
import { validate } from "./validator";

export interface TranscribeAudioDeps {
  readonly transcription: TranscriptionGateway;
}

export type TranscribeAudioHandler = (
  cmd: TranscribeAudioCommand,
) => Promise<TranscriptionResult>;

export function makeTranscribeAudioHandler(
  deps: TranscribeAudioDeps,
): TranscribeAudioHandler {
  return async (cmd) => {
    const v = validate(cmd);
    if (!v.ok) throw v.error;
    return deps.transcription.transcribe({
      audio: cmd.audio,
      mimeType: cmd.mimeType,
      languageHint: cmd.languageHint ?? "fr",
    });
  };
}
