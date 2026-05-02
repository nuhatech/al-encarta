import type { PersonalityRepository } from "@/src/modules/catalog/domain/personality-repo";
import type { VoiceComposer } from "@/src/modules/catalog/application/services/voice-composer";
import type { LlmGateway, StreamChunk } from "@/src/modules/conversation/application/ports/llm-port";
import { NotFound } from "@/src/shared/kernel/errors";
import type { SendMessageCommand } from "./command";
import { validate } from "./validator";

export interface ModelMapping {
  readonly tier1: string;
  readonly tier2: string;
}

export interface SendMessageDeps {
  readonly llm: LlmGateway;
  readonly personalityRepo: PersonalityRepository;
  readonly voiceComposer: VoiceComposer;
  readonly models: ModelMapping;
}

export type SendMessageHandler = (
  cmd: SendMessageCommand,
) => Promise<ReadableStream<StreamChunk>>;

export function makeSendMessageHandler(deps: SendMessageDeps): SendMessageHandler {
  return async (cmd) => {
    const v = validate(cmd);
    if (!v.ok) throw v.error;

    const personality = await deps.personalityRepo.findById(cmd.personalityId);
    if (!personality) throw new NotFound("Personality", cmd.personalityId);

    const systemBlocks = deps.voiceComposer.compose(personality);

    return deps.llm.streamCompletion({
      model: personality.tier === 1 ? deps.models.tier1 : deps.models.tier2,
      maxTokens: 1024,
      systemBlocks,
      messages: [...cmd.transcript, { role: "user", content: cmd.userText }],
    });
  };
}
