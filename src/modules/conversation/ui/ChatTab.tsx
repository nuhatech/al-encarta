"use client";
import { useCallback, useEffect, useState } from "react";
import { useChatStream, type ChatTurn } from "./hooks/use-chat-stream";
import { useSpeechSynthesis } from "./hooks/use-speech-synthesis";
import { MicButton } from "./MicButton";
import { Y2KErrorBanner } from "./Y2KErrorBanner";
import { conversationRepo } from "@/src/modules/conversation/infrastructure/dexie-conversation-repo";
import { findPersonalitySummary } from "@/src/modules/catalog/infrastructure/personality-index";

interface ChatTabProps {
  personalityId: string;
  personalityName: string;
}

export function ChatTab({ personalityId, personalityName }: ChatTabProps) {
  const [hydrated, setHydrated] = useState(false);
  const [initial, setInitial] = useState<ChatTurn[]>([]);

  // Load persisted history once per personality.
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    conversationRepo
      .listForPersonality(personalityId)
      .then((rows) => {
        if (cancelled) return;
        setInitial(rows.map((r) => ({ role: r.role, content: r.content })));
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setInitial([]);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [personalityId]);

  return (
    <ChatTabInner
      key={`${personalityId}-${hydrated ? "ready" : "loading"}`}
      personalityId={personalityId}
      personalityName={personalityName}
      initialTranscript={initial}
      hydrated={hydrated}
    />
  );
}

function ChatTabInner({
  personalityId,
  personalityName,
  initialTranscript,
  hydrated,
}: {
  personalityId: string;
  personalityName: string;
  initialTranscript: ReadonlyArray<ChatTurn>;
  hydrated: boolean;
}) {
  const [input, setInput] = useState("");
  const summary = findPersonalitySummary(personalityId);
  const tts = useSpeechSynthesis({
    lang: "fr-FR",
    gender: summary?.gender,
    pitch: summary?.voice.pitch ?? 1,
    rate: summary?.voice.rate ?? 1,
  });

  const onPersistUserTurn = useCallback(
    (text: string) => conversationRepo.append(personalityId, "user", text),
    [personalityId],
  );
  const onPersistAssistantTurn = useCallback(
    (text: string) => conversationRepo.append(personalityId, "assistant", text),
    [personalityId],
  );
  const onAssistantTurnStart = useCallback(() => {
    tts.reset();
  }, [tts]);
  const onAssistantDelta = useCallback(
    (delta: string) => {
      tts.feed(delta);
    },
    [tts],
  );
  const onAssistantTurnEnd = useCallback(() => {
    tts.flush();
  }, [tts]);

  const { transcript, send, retry, reset, streaming, error } = useChatStream({
    personalityId,
    initialTranscript,
    onPersistUserTurn,
    onPersistAssistantTurn,
    onAssistantDelta,
    onAssistantTurnStart,
    onAssistantTurnEnd,
  });

  const onClear = useCallback(async () => {
    tts.stop();
    await conversationRepo.clear(personalityId);
    reset([]);
  }, [personalityId, reset, tts]);

  if (!hydrated) {
    return (
      <div style={{ padding: 18, fontFamily: "Tahoma, sans-serif", fontSize: 12 }}>
        Chargement de l&apos;historique de conversation…
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // Hourglass cursor while waiting for the LLM. `progress` keeps the UI
        // interactive (unlike `wait`) while signaling load on Win/Linux.
        cursor: streaming ? "progress" : "auto",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#fff",
          padding: 16,
          fontFamily: "Tahoma, sans-serif",
          fontSize: 12,
          color: "#111",
        }}
      >
        {transcript.length === 0 && (
          <p style={{ color: "#666", margin: 0 }}>
            Posez une question à {personalityName} pour commencer la consultation.
            {tts.supported && (
              <>
                <br />
                <small>
                  Astuce : activez le 🔊 pour entendre {personalityName} avec une voix d&apos;époque.
                </small>
              </>
            )}
          </p>
        )}
        {transcript.map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <strong style={{ color: m.role === "user" ? "#000" : "#000080" }}>
              {m.role === "user" ? "Vous" : personalityName} :
            </strong>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 2 }}>
              {m.content}
              {m.role === "assistant" && i === transcript.length - 1 && streaming && (
                <span style={{ opacity: 0.5 }}>▍</span>
              )}
            </div>
          </div>
        ))}
        {error && (
          <Y2KErrorBanner
            error={error}
            onRetry={retry}
            // No onDismiss: the banner clears automatically on next successful send.
          />
        )}
      </div>
      <div
        style={{
          padding: 8,
          borderTop: "1px solid #888",
          display: "flex",
          gap: 6,
          background: "var(--y2k-window)",
          alignItems: "center",
        }}
      >
        {tts.supported && (
          <button
            type="button"
            onClick={tts.toggle}
            title={
              tts.voiceName
                ? `${tts.enabled ? "Couper" : "Activer"} la voix synthétique\nVoix : ${tts.voiceName}`
                : tts.enabled
                  ? "Couper la voix synthétique"
                  : "Activer la voix synthétique (Y2K)"
            }
            style={{
              fontWeight: tts.enabled ? 700 : 400,
              minWidth: 36,
            }}
          >
            {tts.enabled ? (tts.speaking ? "🔊" : "🔉") : "🔈"}
          </button>
        )}
        <MicButton
          disabled={streaming}
          onTranscribed={(text) => {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
          }}
        />
        <input
          style={{ flex: 1 }}
          placeholder="Posez votre question…"
          value={input}
          disabled={streaming}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !streaming && input.trim()) {
              const text = input;
              setInput("");
              void send(text);
            }
          }}
        />
        <button
          disabled={streaming || !input.trim()}
          onClick={() => {
            const text = input;
            setInput("");
            void send(text);
          }}
        >
          Envoyer
        </button>
        <button
          disabled={streaming || transcript.length === 0}
          onClick={() => void onClear()}
          title="Effacer la conversation"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
