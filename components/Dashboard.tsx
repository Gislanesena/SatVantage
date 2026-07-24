"use client";
// Dashboard estilo banco: saldo, enviar/receber, BTC ao vivo, mentor FAB, menu.
import { useCallback, useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import ReceivePanel from "@/components/ReceivePanel";
import ExchangesPanel from "@/components/ExchangesPanel";
import KnowPanel from "@/components/KnowPanel";
import WalletNwc from "@/components/WalletNwc";
import BtcMarket from "@/components/BtcMarket";
import MentorChat from "@/components/MentorChat";
import FreeTopicChat from "@/components/FreeTopicChat";
import LanguageSelect from "@/components/LanguageSelect";
import AccessibilityFooter from "@/components/AccessibilityFooter";
import EmergencyMode from "@/components/EmergencyMode";
import HerancaPanel from "@/components/HerancaPanel";
import QrScanButton from "@/components/QrScanButton";
import { fmtBtc, fmtMoney, satsToFiat, useI18n } from "@/lib/i18n";
import { isMutinyNetBolt11, MUTINYNET_ONLY_MSG, normalizeBolt11 } from "@/lib/mutinynet";
import { MISSION_1_SLUG, MISSION_2_SLUG } from "@/lib/missions";
import {
  KNOW_QUESTIONS,
  MENTOR_SUGGESTIONS,
  topicById,
  type OptionalTopic,
} from "@/lib/optional-topics";
import "./dash.css";
import "./wallet.css";

type DashboardProps = {
  user: { npub?: string; knowledgeLevel?: string };
  onExitToHome: () => void;
};

type Panel = "home" | "receber" | "enviar" | "conectar";
type MentorStep = null | "m1" | "m2";
type Theme = "dark" | "light";
type CardView = "balance" | "statement";

type LedgerKind = "in" | "out" | "transfer";
type LedgerSource = "mission" | "voucher" | "wallet";

type LedgerItem = {
  id: string;
  kind: LedgerKind;
  sats: number;
  source: LedgerSource;
  label: string;
  when: string;
};

function ledgerSourceLabel(item: LedgerItem, locale: "pt" | "en" | "es") {
  if (item.label?.trim()) return item.label.trim();
  const map = {
    pt: {
      mission: "Mentoria SatVantage",
      voucher: "Saque para carteira",
      wallet: "Envio Lightning",
    },
    en: {
      mission: "SatVantage mentorship",
      voucher: "Withdraw to wallet",
      wallet: "Lightning send",
    },
    es: {
      mission: "Mentoría SatVantage",
      voucher: "Retiro a billetera",
      wallet: "Envío Lightning",
    },
  } as const;
  return map[locale][item.source] ?? item.source;
}

function formatLedgerWhen(iso: string, locale: "pt" | "en" | "es") {
  try {
    return new Date(iso).toLocaleString(
      locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR",
      { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" },
    );
  } catch {
    return iso.slice(0, 16);
  }
}

function avatarKey(npub?: string) {
  return `sv_avatar_${npub || "local"}`;
}

function hideKey(npub?: string) {
  return `sv_hide_balance_${npub || "local"}`;
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("sv_theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("sv_theme", next);
  } catch {
    /* ignore */
  }
}

export default function Dashboard({ user, onExitToHome }: DashboardProps) {
  const { t, locale } = useI18n();
  const [panel, setPanel] = useState<Panel>("home");
  const [mentorStep, setMentorStep] = useState<MentorStep>(null);
  const [freeTopic, setFreeTopic] = useState<OptionalTopic | null>(null);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [canEarn, setCanEarn] = useState(false);
  const [m1Eligible, setM1Eligible] = useState(true);
  const [m2Eligible, setM2Eligible] = useState(true);
  const [satsBalance, setSatsBalance] = useState<number | null>(null);
  const [walletSats, setWalletSats] = useState<number | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [soonMsg, setSoonMsg] = useState<string | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [herancaOpen, setHerancaOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [claimRef, setClaimRef] = useState<string | null>(null);
  const [npubShort, setNpubShort] = useState<string | null>(null);
  const [priceBrl, setPriceBrl] = useState<number | null>(null);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [cardView, setCardView] = useState<CardView>("balance");
  const [showSaque, setShowSaque] = useState(false);
  const [claimBolt, setClaimBolt] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimNotice, setClaimNotice] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mentorFabRef = useRef<HTMLDivElement>(null);

  const refreshBalances = useCallback(() => {
    // 4 chamadas independentes — cada uma atualiza seu próprio pedaço de
    // estado assim que responde. Antes era um único Promise.all: se
    // /api/wallet/balance demorasse (relay NWC lento/externo), o saldo
    // SatVantage (que já tinha voltado rápido) ficava preso em "…" junto.
    fetch("/api/rewards/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        setSatsBalance(j.satsBalance ?? 0);
        setClaimRef(j.claimRef ?? null);
        setNpubShort(j.npubShort ?? null);
      })
      .catch(() => {});

    fetch("/api/wallet/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        const connected = !!j.connected;
        setWalletConnected(connected);
        setWalletSats(connected ? (j.balanceSats ?? 0) : null);
        setWalletLabel(
          connected
            ? typeof j.label === "string" && j.label.trim()
              ? j.label.trim()
              : null
            : null,
        );
      })
      .catch(() => {});

    fetch("/api/missions/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        setCanEarn(!!j.canEarn);
        setM1Eligible(!!j.mentoria1?.rewardEligible);
        setM2Eligible(!!j.mentoria2?.rewardEligible);
      })
      .catch(() => {});

    fetch("/api/rewards/ledger")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j || !Array.isArray(j.items)) {
          setLedger([]);
          return;
        }
        setLedger(
          j.items.map(
            (row: {
              id: string;
              kind: LedgerKind;
              sats: number;
              source: LedgerSource;
              label?: string;
              when: string;
            }) => ({
              id: row.id,
              kind: row.kind,
              sats: row.sats,
              source: row.source,
              label: row.label || "",
              when: row.when,
            }),
          ),
        );
      })
      .catch(() => setLedger([]));

    fetch("/api/market/btc?range=24h")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        if (typeof j.priceBrl === "number") setPriceBrl(j.priceBrl);
        if (typeof j.priceUsd === "number") setPriceUsd(j.priceUsd);
      })
      .catch(() => {});
  }, []);

  async function resgatarVoucher() {
    setClaimError(null);
    setClaimNotice(null);
    const bolt = normalizeBolt11(claimBolt);
    if (bolt.toLowerCase().startsWith("lnbc") || !isMutinyNetBolt11(bolt)) {
      setClaimError(MUTINYNET_ONLY_MSG);
      return;
    }
    setClaimBusy(true);
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bolt11: bolt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setClaimBolt("");
      setClaimNotice(
        `Voucher resgatado: ⚡ ${Number(json.satsPaid).toLocaleString("pt-BR")} sats.`,
      );
      void refreshBalances();
    } catch (e: any) {
      setClaimError(e.message ?? "falha no resgate");
    } finally {
      setClaimBusy(false);
    }
  }

  useEffect(() => {
    try {
      const a = localStorage.getItem(avatarKey(user.npub));
      if (a) setAvatarUrl(a);
      setHideBalance(localStorage.getItem(hideKey(user.npub)) === "1");
    } catch {}
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
    void refreshBalances();
  }, [user.npub, refreshBalances]);

  // Reposiciona o VLibras ao abrir o dash (o plugin às vezes some na troca de tela)
  useEffect(() => {
    window.dispatchEvent(new Event("sv-vlibras-repin"));
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("sv-vlibras-repin"));
    }, 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!walletConnected && panel === "enviar") setPanel("home");
    if (walletConnected && panel === "conectar") setPanel("home");
  }, [walletConnected, panel]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t)) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
      // Com chat aberto, não fecha ao clicar fora — só pelo botão Fechar.
      if (mentorStep || freeTopic) return;
      if (!mentorFabRef.current?.contains(t)) {
        setMentorOpen(false);
      }
    }
    if (menuOpen || mentorOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, mentorOpen, mentorStep, freeTopic]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  function toggleHide() {
    setHideBalance((h) => {
      const next = !h;
      try {
        localStorage.setItem(hideKey(user.npub), next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function onPickPhoto(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      setSoonMsg(t.dash.photoTooBig);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      setAvatarUrl(data);
      try {
        localStorage.setItem(avatarKey(user.npub), data);
      } catch {
        setSoonMsg(t.dash.photoSaveFail);
      }
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setAvatarUrl(null);
    try {
      localStorage.removeItem(avatarKey(user.npub));
    } catch {}
  }

  const totalDisplay =
    satsBalance === null
      ? "…"
      : hideBalance
        ? "••••"
        : fmtBtc(satsBalance, locale);

  const fiatBrl =
    satsBalance != null && priceBrl != null
      ? satsToFiat(satsBalance, priceBrl)
      : null;
  const fiatUsd =
    satsBalance != null && priceUsd != null
      ? satsToFiat(satsBalance, priceUsd)
      : null;

  function kindLabel(kind: LedgerKind) {
    if (kind === "in") return t.dash.typeIn;
    if (kind === "out") return t.dash.typeOut;
    return t.dash.typeTransfer;
  }

  function amtPrefix(kind: LedgerKind) {
    if (kind === "in") return "+";
    if (kind === "out") return "−";
    return "↔ ";
  }

  const chatActive = mentorStep !== null || freeTopic !== null;

  function openGuideTopic(id: string) {
    const topic = topicById(id);
    if (!topic) return;
    setMentorStep(null);
    setFreeTopic(topic);
    setMentorOpen(true);
  }

  function closeMentorChat() {
    setMentorStep(null);
    setFreeTopic(null);
    setMentorOpen(true);
    void refreshBalances();
  }

  function endMentorChat() {
    setMentorStep(null);
    setFreeTopic(null);
    setMentorOpen(false);
    void refreshBalances();
  }

  return (
    <div className="sv-bank">
      <header className="sv-bank-top">
        <SiteNav variant="dash" />
        <div className="sv-bank-settings" ref={menuRef}>
          <button
            type="button"
            className="sv-bank-theme"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
            title={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <LanguageSelect variant="bank" />

          <button
            type="button"
            className="sv-bank-avatar-btn"
            aria-label={t.dash.settings}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((o) => !o);
              setProfileOpen(false);
              setSoonMsg(null);
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="sv-bank-avatar-img" />
            ) : (
              <span className="sv-bank-gear" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M19.4 13.2v-2.4l-1.7-.3a6.5 6.5 0 0 0-.5-1.2l1-1.4-1.7-1.7-1.4 1a6.5 6.5 0 0 0-1.2-.5L13.2 4.6h-2.4l-.3 1.7a6.5 6.5 0 0 0-1.2.5l-1.4-1-1.7 1.7 1 1.4a6.5 6.5 0 0 0-.5 1.2l-1.7.3v2.4l1.7.3c.1.4.3.8.5 1.2l-1 1.4 1.7 1.7 1.4-1c.4.2.8.4 1.2.5l.3 1.7h2.4l.3-1.7c.4-.1.8-.3 1.2-.5l1.4 1 1.7-1.7-1-1.4c.2-.4.4-.8.5-1.2l1.7-.3Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="sv-bank-menu" role="menu">
              {!profileOpen ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="sv-bank-menu-item"
                    onClick={() => setProfileOpen(true)}
                  >
                    <span className="sv-bank-menu-ico" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                        <path
                          d="M5.5 19c1.2-3.2 3.5-4.8 6.5-4.8S17.3 15.8 18.5 19"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    {t.dash.profile}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="sv-bank-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileOpen(false);
                      setSoonMsg(null);
                      setHerancaOpen(true);
                    }}
                  >
                    <span className="sv-bank-menu-ico" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 20V9.5L12 4l8 5.5V20"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 20v-6h6v6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {t.dash.estate}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="sv-bank-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      setEmergencyOpen(true);
                    }}
                  >
                    {t.dash.emergency}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="sv-bank-menu-item sv-bank-menu-item--danger"
                    onClick={onExitToHome}
                  >
                    {t.dash.logout}
                  </button>
                  {soonMsg && <p className="sv-bank-menu-note">{soonMsg}</p>}
                </>
              ) : (
                <div className="sv-bank-profile">
                  <button
                    type="button"
                    className="sv-bank-profile-preview"
                    onClick={() => fileRef.current?.click()}
                    aria-label={t.dash.pickPhotoAria}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" />
                    ) : (
                      <span className="sv-bank-profile-placeholder" aria-hidden>
                        +
                      </span>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className="sv-bank-profile-btn"
                    onClick={() => fileRef.current?.click()}
                  >
                    {t.dash.choosePhoto}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      className="sv-bank-menu-item sv-bank-menu-item--muted"
                      onClick={removePhoto}
                    >
                      {t.dash.removePhoto}
                    </button>
                  )}
                  <button
                    type="button"
                    className="sv-bank-menu-item sv-bank-menu-item--muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    {t.dash.back}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="sv-bank-main">
        <div className="sv-bank-home-grid">
          <div className="sv-bank-home-left">
            <section
              className="sv-bank-card"
              aria-label={
                cardView === "statement" ? t.dash.statement : t.dash.availableBalance
              }
            >
              <div className="sv-bank-card-top">
                <div className="sv-bank-label-row">
                  <p className="sv-bank-label">
                    {cardView === "statement"
                      ? t.dash.statement
                      : t.dash.availableBalance}
                  </p>
                  {cardView === "balance" && walletConnected && (
                    <span className="sv-bank-connected">
                      🟢{" "}
                      {t.dash.connectedNamed.replace(
                        "{name}",
                        walletLabel || t.dash.lightningWallet,
                      )}
                    </span>
                  )}
                </div>
                {cardView === "balance" ? (
                  <button
                    type="button"
                    className="sv-bank-eye"
                    onClick={toggleHide}
                    aria-label={hideBalance ? t.dash.showBalance : t.dash.hideBalance}
                    title={hideBalance ? t.dash.showBalance : t.dash.hideBalance}
                  >
                    {hideBalance ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M3 3l18 18M10.6 10.7a2.2 2.2 0 0 0 3 3M9.5 5.3A10.5 10.5 0 0 1 12 5c5.2 0 9 4.5 9.8 7-.3.8-1 2-2.1 3.2M6.1 6.2C4.4 7.5 3.3 9.2 2.2 12c.8 2.5 4.6 7 9.8 7 1.4 0 2.7-.3 3.9-.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M2.2 12C3 9.5 6.8 5 12 5s9 4.5 9.8 7c-.8 2.5-4.6 7-9.8 7s-9-4.5-9.8-7Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sv-bank-stmt-btn"
                    onClick={() => setCardView("balance")}
                  >
                    {t.dash.viewBalance}
                  </button>
                )}
              </div>

              {cardView === "balance" ? (
                <>
                  <p className="sv-bank-amount">{totalDisplay}</p>

                  {!hideBalance && (fiatBrl != null || fiatUsd != null) ? (
                    <div className="sv-bank-fiat" aria-label={t.dash.approxIn}>
                      <div className="sv-bank-fiat-lines">
                        {fiatBrl != null && (
                          <p className="sv-bank-fiat-line">
                            {t.dash.approxIn} {fmtMoney(fiatBrl, "BRL", locale)}
                          </p>
                        )}
                        {fiatUsd != null && (
                          <p className="sv-bank-fiat-line">
                            {t.dash.approxIn} {fmtMoney(fiatUsd, "USD", locale)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="sv-bank-stmt-btn"
                        onClick={() => setCardView("statement")}
                      >
                        {t.dash.statement}
                      </button>
                    </div>
                  ) : (
                    <div className="sv-bank-fiat">
                      <div className="sv-bank-fiat-lines">
                        {hideBalance ? (
                          <p className="sv-bank-fiat-line">••••</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="sv-bank-stmt-btn"
                        onClick={() => setCardView("statement")}
                      >
                        {t.dash.statement}
                      </button>
                    </div>
                  )}

                  {walletConnected && (
                    <p className="sv-bank-sub">
                      {t.dash.lightningWallet}:{" "}
                      {hideBalance
                        ? "••••"
                        : walletSats == null
                          ? "—"
                          : fmtBtc(walletSats, locale)}
                    </p>
                  )}

                  {satsBalance !== null && satsBalance > 0 && (
                    <div className="sv-bank-voucher-note">
                      <p className="sv-bank-voucher-title">{t.dash.voucherTitle}</p>
                      <p className="sv-bank-sub">
                        {t.dash.voucherBody}
                        {npubShort ? ` (${npubShort})` : ""}.
                        {claimRef ? (
                          <>
                            {" "}
                            Ref. <code>{claimRef}</code>
                          </>
                        ) : null}
                      </p>
                      <button
                        type="button"
                        className={`sv-bank-voucher-cta${showSaque ? " is-active" : ""}`}
                        aria-expanded={showSaque}
                        onClick={() => {
                          setShowSaque((v) => !v);
                          setClaimError(null);
                          setClaimNotice(null);
                        }}
                      >
                        {t.dash.withdrawSats}
                      </button>
                      {showSaque && (
                        <div className="sv-bank-saque-inline">
                          <QrScanButton
                            onScan={(value) => {
                              const bolt = normalizeBolt11(value);
                              setClaimBolt(bolt);
                              setClaimError(null);
                              setClaimNotice(null);
                              if (bolt && !isMutinyNetBolt11(bolt)) {
                                setClaimError(MUTINYNET_ONLY_MSG);
                              }
                            }}
                          />
                          <input
                            className="sv-bank-saque-input"
                            placeholder="lntbs1… (MutinyNet)"
                            value={claimBolt}
                            onChange={(e) => {
                              setClaimBolt(e.target.value);
                              setClaimError(null);
                            }}
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <button
                            type="button"
                            className="sv-bank-voucher-cta"
                            disabled={!claimBolt || claimBusy}
                            onClick={() => void resgatarVoucher()}
                          >
                            {claimBusy ? "…" : t.dash.withdrawSats}
                          </button>
                          {claimNotice && (
                            <p className="sv-bank-saque-notice">{claimNotice}</p>
                          )}
                          {claimError && (
                            <p role="alert" className="sv-bank-saque-error">
                              {claimError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {ledger.length === 0 ? (
                    <p className="sv-bank-ledger-empty">{t.dash.statementEmpty}</p>
                  ) : (
                    <ul className="sv-bank-ledger">
                      {ledger.map((item) => (
                        <li key={item.id} className="sv-bank-ledger-row">
                          <p className="sv-bank-ledger-kind">{kindLabel(item.kind)}</p>
                          <p className={`sv-bank-ledger-amt is-${item.kind}`}>
                            {amtPrefix(item.kind)}
                            {hideBalance ? "••••" : fmtBtc(item.sats, locale)}
                          </p>
                          <p className="sv-bank-ledger-from">
                            {ledgerSourceLabel(item, locale)} ·{" "}
                            {formatLedgerWhen(item.when, locale)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>

            {walletConnected ? (
              <>
                <div className="sv-bank-actions" role="group" aria-label={t.dash.move}>
                  <button
                    type="button"
                    className={`sv-bank-action${panel === "receber" ? " is-active" : ""}`}
                    onClick={() => {
                      setPanel((p) => (p === "receber" ? "home" : "receber"));
                      void refreshBalances();
                    }}
                  >
                    <span className="sv-bank-action-ico" aria-hidden>
                      ↓
                    </span>
                    {t.dash.receive}
                  </button>
                  <button
                    type="button"
                    className={`sv-bank-action${panel === "enviar" ? " is-active" : ""}`}
                    onClick={() => {
                      setPanel((p) => (p === "enviar" ? "home" : "enviar"));
                      void refreshBalances();
                    }}
                  >
                    <span className="sv-bank-action-ico" aria-hidden>
                      ↑
                    </span>
                    {t.dash.send}
                  </button>
                </div>

                {panel === "receber" && (
                  <div className="sv-bank-panel">
                    <ReceivePanel
                      connected={walletConnected}
                      onChanged={() => void refreshBalances()}
                    />
                  </div>
                )}

                {panel === "enviar" && (
                  <div className="sv-bank-panel">
                    <WalletNwc embedded onChanged={() => void refreshBalances()} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="sv-bank-actions" role="group" aria-label={t.dash.connectWalletTitle}>
                  <button
                    type="button"
                    className={`sv-bank-action${panel === "conectar" ? " is-active" : ""}`}
                    onClick={() => {
                      setPanel((p) => (p === "conectar" ? "home" : "conectar"));
                      void refreshBalances();
                    }}
                  >
                    <span className="sv-bank-action-ico" aria-hidden>
                      ⚡
                    </span>
                    {t.dash.connectWalletTitle}
                  </button>
                </div>

                {panel === "conectar" && (
                  <div className="sv-bank-panel">
                    <WalletNwc embedded onChanged={() => void refreshBalances()} />
                  </div>
                )}
              </>
            )}

            <ExchangesPanel />
          </div>

          <div className="sv-bank-home-right">
            <BtcMarket />
            <KnowPanel onAsk={openGuideTopic} />
          </div>
        </div>
      </main>

      {herancaOpen && (
        <div className="sv-heranca-screen" role="dialog" aria-modal="true" aria-label={t.dash.estate}>
          <div className="sv-heranca-screen-bar">
            <button
              type="button"
              className="sv-heranca-screen-back"
              onClick={() => setHerancaOpen(false)}
            >
              ← {t.dash.back}
            </button>
            <strong>{t.dash.estate}</strong>
          </div>
          <div className="sv-heranca-screen-body">
            <HerancaPanel onCheckinSuccess={() => setHerancaOpen(false)} />
          </div>
        </div>
      )}

      <div className={`sv-mentor-fab-wrap${chatActive ? " is-chat" : ""}`} ref={mentorFabRef}>
        {mentorOpen && (
          <div
            className={`sv-mentor-sheet${chatActive ? " sv-mentor-sheet--chat" : ""}`}
            role="dialog"
            aria-label="NagAI SatVantage"
          >
            <div className="sv-mentor-sheet-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/satvantage-mentor.png" alt="" width={40} height={40} />
              <div className="sv-mentor-sheet-titles">
                <strong>NagAI</strong>
                <p>
                  {freeTopic
                    ? freeTopic.label
                    : mentorStep === "m1"
                      ? "Primeiros passos no Bitcoin"
                      : mentorStep === "m2"
                        ? "Carteira e Lightning"
                        : "Em que posso te ajudar?"}
                </p>
              </div>
              <button
                type="button"
                className="sv-mentor-sheet-close"
                aria-label="Fechar NagAI"
                onClick={endMentorChat}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {chatActive ? (
              freeTopic ? (
                <FreeTopicChat
                  embedded
                  sheetHosted
                  topic={freeTopic}
                  onBack={closeMentorChat}
                />
              ) : mentorStep === "m1" || mentorStep === "m2" ? (
                <MentorChat
                  embedded
                  sheetHosted
                  slug={mentorStep === "m1" ? MISSION_1_SLUG : MISSION_2_SLUG}
                  fromDashboard
                  onExitToHome={onExitToHome}
                  onContinueMentor={() => {
                    setMentorOpen(true);
                    setMentorStep("m2");
                  }}
                  onGoDashboard={endMentorChat}
                  onBalanceChanged={() => void refreshBalances()}
                />
              ) : null
            ) : (
              <>
                <p className="sv-mentor-sheet-label">Dúvidas importantes</p>
                <div className="sv-mentor-chips">
                  {KNOW_QUESTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="sv-mentor-chip"
                      onClick={() => openGuideTopic(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <p className="sv-mentor-sheet-label">Sugestões</p>
                <div className="sv-mentor-chips">
                  {MENTOR_SUGGESTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="sv-mentor-chip"
                      onClick={() => openGuideTopic(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <p className="sv-mentor-sheet-label">
                  Com NagAI · sats {canEarn ? "" : "(já creditados nesta conta)"}
                </p>
                <div className="sv-mentor-chips">
                  <button
                    type="button"
                    className="sv-mentor-chip sv-mentor-chip--earn"
                    onClick={() => {
                      setFreeTopic(null);
                      setMentorOpen(true);
                      setMentorStep("m1");
                    }}
                  >
                    NagAI · Bitcoin {m1Eligible ? "· ganha sats" : "· prática"}
                  </button>
                  <button
                    type="button"
                    className="sv-mentor-chip sv-mentor-chip--earn"
                    onClick={() => {
                      setFreeTopic(null);
                      setMentorOpen(true);
                      setMentorStep("m2");
                    }}
                  >
                    NagAI · Carteira e Lightning {m2Eligible ? "· ganha sats" : "· prática"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          className="sv-mentor-fab"
          aria-label={mentorOpen ? "Fechar NagAI" : "Abrir NagAI"}
          aria-expanded={mentorOpen}
          onClick={() => {
            if (mentorOpen) endMentorChat();
            else {
              setMentorStep(null);
              setFreeTopic(null);
              setMentorOpen(true);
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/satvantage-mentor.png" alt="" width={56} height={56} />
        </button>
      </div>

      <AccessibilityFooter />

      <EmergencyMode
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        onDisconnected={() => {
          window.dispatchEvent(new Event("sv-emergency-disconnected"));
          void refreshBalances();
        }}
      />
    </div>
  );
}
