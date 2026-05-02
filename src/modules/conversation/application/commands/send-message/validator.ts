import { Result, ok, err } from "@/src/shared/kernel/result";
import { ValidationError } from "@/src/shared/kernel/errors";
import type { SendMessageCommand } from "./command";

export function validate(
  cmd: SendMessageCommand,
): Result<SendMessageCommand, ValidationError> {
  if (!cmd.userText.trim()) {
    return err(new ValidationError("userText", "empty"));
  }
  if (cmd.userText.length > 2000) {
    return err(new ValidationError("userText", "too_long_max_2000"));
  }
  if (cmd.transcript.length > 40) {
    return err(new ValidationError("transcript", "too_long_max_40_turns"));
  }
  if (!cmd.personalityId) {
    return err(new ValidationError("personalityId", "required"));
  }
  return ok(cmd);
}
