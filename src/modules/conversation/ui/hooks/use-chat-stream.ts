"use client";
import { useCallback, useState } from "react";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type ChatErrorKind =
  | "rate-limit" // 429 from upstream LLM (Anthropic)
  | "network" // fetch failed (offline, dropped connection, CORS)
  | "auth" // 401/403 — bad or missing API key
  | "server" // 5xx from our route
  | "validation" // 400 — bad input (rare in our UI)
  | "unknown";

export interface ChatError {
  readonly kind: ChatErrorKind;
  readonly message: string;
  /** For rate-limit, seconds until retry per Retry-After header. */
  readonly retryAfterSec?: number;
}

interface UseChatStreamOpts {
  personalityId: string;
  initialTranscript?: ReadonlyArray<ChatTurn>;
  onPersistUserTurn?: (text: string) => void | Promise<void>;
  onPersistAssistantTurn?: (text: string) => void | Promise<void>;
  /** Called for every assistant text delta (TTS streaming). */
  onAssistantDelta?: (delta: string) => void;
  /** Called when a new assistant turn starts (TTS reset point). */
  onAssistantTurnStart?: () => void;
  /** Called when an assistant turn finishes streaming (TTS flush point). */
  onAssistantTurnEnd?: () => void;
}

function classifyHttpError(
  status: number,
  bodyError: string | undefined,
  retryAfterHeader: string | null,
): ChatError {
  const message = bodyError ?? `http_${status}`;
  if (status === 429) {
    const sec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
    return {
      kind: "rate-limit",
      message,
      retryAfterSec: Number.isFinite(sec) ? sec : undefined,
    };
  }
  if (status === 401 || status === 403) return { kind: "auth", message };
  if (status === 400) return { kind: "validation", message };
  if (status >= 500) return { kind: "server", message };
  return { kind: "unknown", message };
}

function classifyThrown(e: unknown): ChatError {
  // Browser fetch typically throws TypeError on network failure.
  if (e instanceof TypeError) {
    return { kind: "network", message: e.message || "network" };
  }
  if (e instanceof Error) {
    // Anthropic's stream may emit an error event with a message we forward.
    if (/rate.?limit|429|quota/i.test(e.message)) {
      return { kind: "rate-limit", message: e.message };
    }
    if (/unauthor|invalid.api.key|401|403/i.test(e.message)) {
      return { kind: "auth", message: e.message };
    }
    if (/network|fetch|disconnect/i.test(e.message)) {
      return { kind: "network", message: e.message };
    }
    return { kind: "unknown", message: e.message };
  }
  return { kind: "unknown", message: String(e) };
}

export function useChatStream({
  personalityId,
  initialTranscript,
  onPersistUserTurn,
  onPersistAssistantTurn,
  onAssistantDelta,
  onAssistantTurnStart,
  onAssistantTurnEnd,
}: UseChatStreamOpts) {
  const [transcript, setTranscript] = useState<ChatTurn[]>(
    initialTranscript ? [...initialTranscript] : [],
  );
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [lastUserText, setLastUserText] = useState<string | null>(null);

  const reset = useCallback((to: ReadonlyArray<ChatTurn> = []) => {
    setTranscript([...to]);
    setError(null);
    setLastUserText(null);
  }, []);

  const send = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || streaming) return;
      setError(null);
      setLastUserText(trimmed);
      setStreaming(true);

      const next: ChatTurn[] = [...transcript, { role: "user", content: trimmed }];
      setTranscript([...next, { role: "assistant", content: "" }]);
      void onPersistUserTurn?.(trimmed);
      onAssistantTurnStart?.();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ personalityId, userText: trimmed, transcript }),
        });
        if (!res.ok || !res.body) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          const retryAfter = res.headers.get("retry-after");
          throw classifyHttpError(res.status, body.error, retryAfter);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantSoFar = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const payload = dataLine.slice(5).trim();
            if (!payload) continue;
            const chunk = JSON.parse(payload) as
              | { type: "text-delta"; delta: string }
              | { type: "done" }
              | { type: "error"; message: string };

            if (chunk.type === "text-delta") {
              assistantSoFar += chunk.delta;
              setTranscript([...next, { role: "assistant", content: assistantSoFar }]);
              onAssistantDelta?.(chunk.delta);
            } else if (chunk.type === "error") {
              throw new Error(chunk.message);
            }
          }
        }

        if (assistantSoFar) {
          void onPersistAssistantTurn?.(assistantSoFar);
        }
        onAssistantTurnEnd?.();
      } catch (e) {
        // Errors thrown as ChatError objects (from classifyHttpError) keep their kind.
        const isChatError =
          typeof e === "object" && e !== null && "kind" in e && "message" in e;
        const err: ChatError = isChatError ? (e as ChatError) : classifyThrown(e);
        setError(err);
      } finally {
        setStreaming(false);
      }
    },
    [
      personalityId,
      streaming,
      transcript,
      onPersistUserTurn,
      onPersistAssistantTurn,
      onAssistantDelta,
      onAssistantTurnStart,
      onAssistantTurnEnd,
    ],
  );

  /** Replays the last user message — useful from a Retry button. */
  const retry = useCallback(() => {
    if (!lastUserText || streaming) return;
    // Roll back the optimistic user+assistant pair we appended last turn.
    setTranscript((prev) => {
      const cleaned = [...prev];
      // Drop trailing empty/partial assistant + the last user message we'll re-send.
      while (cleaned.length > 0 && cleaned[cleaned.length - 1]?.role === "assistant") {
        cleaned.pop();
      }
      if (cleaned[cleaned.length - 1]?.role === "user") cleaned.pop();
      return cleaned;
    });
    void send(lastUserText);
  }, [lastUserText, streaming, send]);

  return { transcript, send, retry, reset, streaming, error };
}
