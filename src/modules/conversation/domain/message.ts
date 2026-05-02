import type { Id } from "@/src/shared/kernel/id";
import { newId } from "@/src/shared/kernel/id";
import type { Role } from "./role";

export type MessageId = Id<"Message">;

export interface MessageProps {
  readonly id: MessageId;
  readonly role: Role;
  readonly content: string;
  readonly createdAt: Date;
}

export class Message {
  private constructor(
    public readonly id: MessageId,
    public readonly role: Role,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}

  static user(content: string, now: Date): Message {
    return new Message(newId<"Message">(), "user", content, now);
  }

  static assistant(content: string, now: Date): Message {
    return new Message(newId<"Message">(), "assistant", content, now);
  }

  static rehydrate(props: MessageProps): Message {
    return new Message(props.id, props.role, props.content, props.createdAt);
  }
}
