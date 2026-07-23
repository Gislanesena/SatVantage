"use client";

import { useSpeechToText } from "@/lib/use-speech-to-text";
import { useI18n } from "@/lib/i18n";

type ChatComposerProps = {
  draft: string;
  setDraft: (v: string | ((prev: string) => string)) => void;
  disabled?: boolean;
  placeholder?: string;
  onSubmit: () => void;
  /** Se false, o botão envia mostra ícone (MentorChat); true = texto "Enviar" */
  sendLabel?: "icon" | "text";
  inputId?: string;
};

/**
 * Composer isolado: input + mic (Gemini-style) + enviar.
 */
export default function ChatComposer({
  draft,
  setDraft,
  disabled = false,
  placeholder = undefined,
  onSubmit,
  sendLabel = "icon",
  inputId = "sv-chat-composer-input",
}: ChatComposerProps) {
  const { t } = useI18n();
  const speech = useSpeechToText({ draft, setDraft, disabled });
  const ph = placeholder ?? t.nagai.askPlaceholder;

  return (
    <div
      className="sv-composer"
      data-mic-status={speech.status}
      data-listening={speech.listening ? "true" : "false"}
    >
      {speech.status !== "idle" && speech.statusMessage ? (
        <p
          className={`sv-mic-status${
            speech.status === "listening" ? " sv-mic-status--on" : " sv-mic-status--err"
          }`}
          role="status"
          aria-live="polite"
        >
          {speech.statusMessage}
        </p>
      ) : null}

      <form
        className="sv-chat-ask"
        onSubmit={(e) => {
          e.preventDefault();
          if (disabled || !draft.trim()) return;
          speech.stop();
          onSubmit();
        }}
      >
        <label className="sv-sr-only" htmlFor={inputId}>
          {t.a11y.chatInput}
        </label>
        <input
          id={inputId}
          className="sv-chat-ask-input"
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={speech.listening ? "…" : ph}
          autoComplete="off"
          aria-label={t.a11y.chatInput}
          onChange={(e) => setDraft(e.target.value)}
        />

        <button
          type="button"
          className={`sv-chat-mic${speech.listening ? " sv-chat-mic--on" : ""}`}
          data-state={speech.status}
          aria-label={speech.listening ? t.a11y.micStop : t.a11y.micStart}
          aria-pressed={speech.listening}
          disabled={disabled}
          onClick={() => speech.toggle()}
          title={speech.listening ? t.a11y.micStop : t.a11y.micStart}
        >
          <span className="sv-chat-mic-rings" aria-hidden>
            <span className="sv-chat-mic-ring sv-chat-mic-ring--1" />
            <span className="sv-chat-mic-ring sv-chat-mic-ring--2" />
            <span className="sv-chat-mic-ring sv-chat-mic-ring--3" />
          </span>

          <span className="sv-chat-mic-core" aria-hidden>
            <span className="sv-chat-mic-waves">
              <span />
              <span />
              <span />
              <span />
            </span>
            <svg
              className="sv-chat-mic-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <button
          type="submit"
          className="sv-chat-ask-send"
          disabled={disabled || !draft.trim()}
          aria-label={t.a11y.sendMessage}
        >
          {sendLabel === "text" ? (
            "Enviar"
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 12h14M13 6l7 6-7 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
