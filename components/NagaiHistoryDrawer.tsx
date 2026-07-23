"use client";

import { useCallback, useEffect, useState } from "react";
import A11yDialog from "@/components/A11yDialog";
import {
  deleteHistoryConversation,
  formatHistoryDate,
  listHistoryMeta,
  loadHistoryMessages,
  resolveHistoryScope,
  type NagaiHistoryLine,
  type NagaiHistoryMeta,
} from "@/lib/nagai-history";
import { useI18n, type Locale } from "@/lib/i18n";
import "./mentor.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string, lines: NagaiHistoryLine[]) => void;
  activeId?: string | null;
};

export default function NagaiHistoryDrawer({
  open,
  onClose,
  onSelect,
  activeId,
}: Props) {
  const { t, locale } = useI18n();
  const [scope, setScope] = useState("guest");
  const [items, setItems] = useState<NagaiHistoryMeta[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    async (nextScope?: string) => {
      const s = nextScope ?? (await resolveHistoryScope());
      setScope(s);
      setItems(listHistoryMeta(s, locale as Locale));
    },
    [locale],
  );

  useEffect(() => {
    if (!open) return;
    setBusy(true);
    void refresh().finally(() => setBusy(false));
  }, [open, refresh]);

  async function openConversation(meta: NagaiHistoryMeta) {
    setLoadingId(meta.id);
    try {
      // Mensagens só sob demanda
      const lines = loadHistoryMessages(scope, meta.id);
      if (!lines?.length) return;
      onSelect(meta.id, lines);
      onClose();
    } finally {
      setLoadingId(null);
    }
  }

  function remove(meta: NagaiHistoryMeta) {
    deleteHistoryConversation(scope, meta.id);
    setItems(listHistoryMeta(scope, locale as Locale));
  }

  return (
    <A11yDialog
      open={open}
      onClose={onClose}
      labelledBy="sv-nagai-hist-title"
      className="sv-nagai-hist"
      backdropClassName="sv-a11y-dialog-backdrop"
    >
      <div className="sv-nagai-hist-head">
        <h2 id="sv-nagai-hist-title">{t.nagai.historyTitle}</h2>
        <button
          type="button"
          className="sv-toolbar-btn sv-toolbar-btn--ghost"
          onClick={onClose}
        >
          {t.nagai.cancel}
        </button>
      </div>
      <p className="sv-nagai-hist-desc">{t.nagai.historyDesc}</p>

      {busy ? (
        <p className="sv-nagai-hist-empty">{t.a11y.loading}…</p>
      ) : items.length === 0 ? (
        <p className="sv-nagai-hist-empty">{t.nagai.historyEmpty}</p>
      ) : (
        <ul className="sv-nagai-hist-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sv-nagai-hist-item${
                  activeId === item.id ? " is-active" : ""
                }`}
                disabled={loadingId === item.id}
                onClick={() => void openConversation(item)}
              >
                <span className="sv-nagai-hist-date">
                  {formatHistoryDate(item.updatedAt, locale as Locale)}
                </span>
                <span className="sv-nagai-hist-summary">{item.summary}</span>
                <span className="sv-nagai-hist-meta">
                  {t.nagai.historyMessages.replace(
                    "{n}",
                    String(item.messageCount),
                  )}
                  {loadingId === item.id ? ` · ${t.a11y.loading}…` : null}
                </span>
              </button>
              <button
                type="button"
                className="sv-nagai-hist-del"
                aria-label={t.nagai.historyDelete}
                title={t.nagai.historyDelete}
                onClick={() => remove(item)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </A11yDialog>
  );
}
