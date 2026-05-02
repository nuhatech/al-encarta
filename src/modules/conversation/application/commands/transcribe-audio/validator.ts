import { Result, ok, err } from "@/src/shared/kernel/result";
import { ValidationError } from "@/src/shared/kernel/errors";
import type { TranscribeAudioCommand } from "./command";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB cap, well above any 60s clip in webm/opus
const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
]);

export function validate(
  cmd: TranscribeAudioCommand,
): Result<TranscribeAudioCommand, ValidationError> {
  if (!cmd.audio || cmd.audio.size === 0) {
    return err(new ValidationError("audio", "empty"));
  }
  if (cmd.audio.size > MAX_BYTES) {
    return err(new ValidationError("audio", "too_large_max_5mb"));
  }
  // Some browsers append codec hints; normalize comparison.
  const baseMime = cmd.mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  const normalized = cmd.mimeType.toLowerCase();
  if (!ALLOWED_MIME.has(normalized) && !ALLOWED_MIME.has(baseMime)) {
    return err(new ValidationError("mimeType", `unsupported:${cmd.mimeType}`));
  }
  return ok(cmd);
}
